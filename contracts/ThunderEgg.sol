// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/introspection/ERC165.sol";
import "./interfaces/IERC721Token.sol";
import "./interfaces/IERC721Receiver.sol";

import "./NRGToken.sol";

import "./libs/Strings.sol"; // FIXME use lib properly


// In the fertile SacredGrove ThunderEggs born and grow with tremendous $NRG
//
// Note that it's ownable and the owner wields tremendous power.
//
// Don't mess with the Gods especially the God of Thunder!
contract ThunderEgg is Ownable, IERC721Token, ERC165 {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // ** Chef

    // Info of each user.
    struct UserInfo {
        uint256 amount;     // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
        //
        // We do some fancy math here. Basically, any point in time, the amount of NRG entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * pool.accNRGPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
        //   1. The pool's `accNRGPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }

    // Info of each pool.
    struct PoolInfo {
        IERC20 lpToken;           // Address of LP token contract.
        uint256 allocPoint;       // How many allocation points assigned to this pool. NRGs to distribute per block.
        uint256 lastRewardBlock;  // Last block number that NRGs distribution occurs.
        uint256 accNRGPerShare; // Accumulated NRG per share, times 1e12. See below.
    }

    // The NRGToken TOKEN!
    NRGToken public nrg;
    // Block number when bonus period ends.
    uint256 public bonusEndBlock;
    // NRG tokens created per block.
    uint256 public nrgPerBlock;
    // Bonus muliplier for early makers.
    uint256 public constant BONUS_MULTIPLIER = 10;
    // Info of each pool.
    PoolInfo[] public poolInfo;
    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    // Total allocation poitns. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;
    // The block number when mining starts.
    uint256 public startBlock;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);

    // ** end Chef

    // ** ERC721

    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;
    bytes4 private constant _INTERFACE_ID_ERC721_METADATA = 0x5b5e139f;

    // Function selector for ERC721Receiver.onERC721Received
    // 0x150b7a02
    bytes4 constant internal ERC721_RECEIVED = bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));

    string public baseTokenURI;

    // Note: the first token ID will be 1
    uint256 public tokenPointer;

    // Token name
    string public name = "ThunderEgg";

    // Token symbol
    string public symbol = "TEGG";

    uint256 public totalSupply;

    // Mapping of tokenId => owner
    mapping(uint256 => address) internal thunderEggIdToOwner;
    mapping(uint256 => uint256) internal thunderEggIdToBirth;
    mapping(address => uint256) internal ownerToThunderEggId;

    // Mapping of tokenId => approved address
    mapping(uint256 => address) internal approvals;

    // Mapping of owner => operator => approved
    mapping(address => mapping(address => bool)) internal operatorApprovals;

    // ** end ERC721

    constructor(
        NRGToken _nrg,
        uint256 _nrgPerBlock,
        uint256 _startBlock,
        uint256 _bonusEndBlock
    ) public {
        nrg = _nrg;
        nrgPerBlock = _nrgPerBlock;
        bonusEndBlock = _bonusEndBlock;
        startBlock = _startBlock;

        _registerInterface(_INTERFACE_ID_ERC721);
        _registerInterface(_INTERFACE_ID_ERC721_METADATA);
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    // Add a new lp to the pool. Can only be called by the owner.
    // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.
    function addToPools(uint256 _allocPoint, IERC20 _lpToken, bool _withUpdate) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(PoolInfo({
            lpToken : _lpToken,
            allocPoint : _allocPoint,
            lastRewardBlock : lastRewardBlock,
            accNRGPerShare : 0
            }));
    }

    // Update the given pool's allocation point. Can only be called by the owner.
    function set(uint256 _pid, uint256 _allocPoint, bool _withUpdate) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(_allocPoint);
        poolInfo[_pid].allocPoint = _allocPoint;
    }


    // Return reward multiplier over the given _from to _to block.
    function getMultiplier(uint256 _from, uint256 _to) public view returns (uint256) {
        if (_to <= bonusEndBlock) {
            return _to.sub(_from).mul(BONUS_MULTIPLIER);
        } else if (_from >= bonusEndBlock) {
            return _to.sub(_from);
        } else {
            return bonusEndBlock.sub(_from).mul(BONUS_MULTIPLIER).add(
                _to.sub(bonusEndBlock)
            );
        }
    }

    function thunderEggStats(uint256 _pid, uint256 _tokenId) external view returns (address _owner, uint256 _birth, uint256 _lp, uint256 _nrg) {
        address owner = thunderEggIdToOwner[_tokenId];
        require(owner != address(0), "No ThunderEgg!");

        UserInfo memory user = userInfo[_pid][owner];

        return (owner, thunderEggIdToBirth[_tokenId], user.amount, _calculatePendingNRG(_pid, owner));
    }

    // View function to see pending SUSHIs on frontend.
    function pendingNRG(uint256 _pid, address _user) external view returns (uint256) {
        // no ThunderEgg, no NRG!
        if (ownerToThunderEggId[_user] == 0) {
            return 0;
        }

        return _calculatePendingNRG(_pid, _user);
    }


    function _calculatePendingNRG(uint256 _pid, address _user) internal view returns (uint256) {
        PoolInfo memory pool = poolInfo[_pid];
        UserInfo memory user = userInfo[_pid][_user];
        uint256 accNRGPerShare = pool.accNRGPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 nrgReward = multiplier.mul(nrgPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
            accNRGPerShare = accNRGPerShare.add(nrgReward.mul(1e12).div(lpSupply));
        }
        return user.amount.mul(accNRGPerShare).div(1e12).sub(user.rewardDebt);
    }

    // Update reward variables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }

        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }

        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 nrgReward = multiplier.mul(nrgPerBlock).mul(pool.allocPoint).div(totalAllocPoint);

        nrg.mint(address(this), nrgReward);

        pool.accNRGPerShare = pool.accNRGPerShare.add(nrgReward.mul(1e18).div(lpSupply));
        pool.lastRewardBlock = block.number;
    }

    // Deposit LP tokens, mint the ThunderEgg and set allocations...
    function deposit(uint256 _pid, uint256 _amount) public {
        require(ownerToThunderEggId[msg.sender] == 0, "Thor has already blessed you with a ThunderEgg!");

        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        updatePool(_pid);

        // credit the staked amount
        if (_amount > 0) {
            pool.lpToken.safeTransferFrom(address(msg.sender), address(this), _amount);
            user.amount = user.amount.add(_amount);
        }

        // Thunder 🥚 time!
        _mint(msg.sender);

        user.rewardDebt = user.amount.mul(pool.accNRGPerShare).div(1e18);
        emit Deposit(msg.sender, _pid, _amount);
    }

    // Withdraw LP tokens from MasterChef.
    function withdraw(uint256 _pid) public {
        require(ownerToThunderEggId[msg.sender] != 0, "No ThunderEgg!");

        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        updatePool(_pid);

        // burn the token - send all rewards and LP back!
        _burn(ownerToThunderEggId[msg.sender]);

        uint256 pending = user.amount.mul(pool.accNRGPerShare).div(1e18).sub(user.rewardDebt);
        if (pending > 0) {
            safeNrgTransfer(msg.sender, pending);
        }

        // send all LP back...
        pool.lpToken.safeTransfer(address(msg.sender), user.amount);

        user.rewardDebt = user.amount.mul(pool.accNRGPerShare).div(1e18);
        emit Withdraw(msg.sender, _pid, user.amount);
    }

    // Safe sushi transfer function, just in case if rounding error causes pool to not have enough SUSHIs.
    function safeNrgTransfer(address _to, uint256 _amount) internal {
        uint256 nrgBal = nrg.balanceOf(address(this));
        if (_amount > nrgBal) {
            nrg.transfer(_to, nrgBal);
        } else {
            nrg.transfer(_to, _amount);
        }
    }

    // *** ERC721 functions below

    function isContract(address account) internal view returns (bool) {
        // According to EIP-1052, 0x0 is the value returned for not-yet created accounts
        // and 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470 is returned
        // for accounts without code, i.e. `keccak256('')`
        bytes32 codehash;
        bytes32 accountHash = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
        // solhint-disable-next-line no-inline-assembly
        assembly {codehash := extcodehash(account)}
        return (codehash != accountHash && codehash != 0x0);
    }

    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory _data)
    private returns (bool)
    {
        if (!isContract(to)) {
            return true;
        }
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = to.call(abi.encodeWithSelector(
                IERC721Receiver(to).onERC721Received.selector,
                msg.sender,
                from,
                tokenId,
                _data
            ));
        if (!success) {
            if (returndata.length > 0) {
                // solhint-disable-next-line no-inline-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert("ERC721: transfer to non ERC721Receiver implementer");
            }
        } else {
            bytes4 retval = abi.decode(returndata, (bytes4));
            return (retval == ERC721_RECEIVED);
        }
    }

    function setBaseTokenURI(string calldata _uri) external onlyOwner {
        baseTokenURI = _uri;
    }

    function _mint(
        address _to
    ) internal returns (uint256) {
        require(_to != address(0), "ERC721: mint to the zero address");

        tokenPointer = tokenPointer.add(1);
        uint256 tokenId = tokenPointer;

        // Mint
        thunderEggIdToOwner[tokenId] = _to;
        ownerToThunderEggId[msg.sender] = tokenId;

        // birth
        thunderEggIdToBirth[tokenId] = block.number;

        // MetaData
        totalSupply = totalSupply.add(1);

        // Single Transfer event for a single token
        emit Transfer(address(0), _to, tokenId);

        return tokenId;
    }

    function exists(uint256 _tokenId) external view returns (bool) {
        return thunderEggIdToOwner[_tokenId] != address(0);
    }

    function tokenURI(uint256 _tokenId) external view returns (string memory) {
        require(thunderEggIdToOwner[_tokenId] != address(0), "must exist");
        return Strings.strConcat(baseTokenURI, Strings.uint2str(_tokenId));
    }

    function _burn(uint256 _tokenId)
    internal
    {
        address owner = thunderEggIdToOwner[_tokenId];

        require(
            owner == msg.sender,
            "Must own the egg!"
        );

        require(
            owner != address(0),
            "ERC721_ZERO_OWNER_ADDRESS"
        );

        thunderEggIdToOwner[_tokenId] = address(0);
        ownerToThunderEggId[msg.sender] = 0;

        totalSupply = totalSupply.sub(1);

        emit Transfer(
            owner,
            address(0),
            _tokenId
        );
    }

    /// @notice Transfers the ownership of an NFT from one address to another address
    /// @dev This works identically to the other function with an extra data parameter,
    ///      except this function just sets data to "".
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) override public {
        safeTransferFrom(_from, _to, _tokenId, "");
    }

    /// @notice Transfers the ownership of an NFT from one address to another address
    /// @dev Throws unless `msg.sender` is the current owner, an authorized
    ///      operator, or the approved address for this NFT. Throws if `_from` is
    ///      not the current owner. Throws if `_to` is the zero address. Throws if
    ///      `_tokenId` is not a valid NFT. When transfer is complete, this function
    ///      checks if `_to` is a smart contract (code size > 0). If so, it calls
    ///      `onERC721Received` on `_to` and throws if the return value is not
    ///      `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`.
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    /// @param _data Additional data with no specified format, sent in call to `_to`
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    )
    override
    public
    {
        transferFrom(_from, _to, _tokenId);
        require(_checkOnERC721Received(_from, _to, _tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
    }

    /// @notice Change or reaffirm the approved address for an NFT
    /// @dev The zero address indicates there is no approved address.
    ///      Throws unless `msg.sender` is the current NFT owner, or an authorized
    ///      operator of the current owner.
    /// @param _approved The new approved NFT controller
    /// @param _tokenId The NFT to approve
    function approve(address _approved, uint256 _tokenId)
    override
    external
    {
        address owner = ownerOf(_tokenId);
        require(_approved != owner, "ERC721: approval to current owner");

        require(
            msg.sender == owner || isApprovedForAll(owner, msg.sender),
            "ERC721: approve caller is not owner nor approved for all"
        );

        approvals[_tokenId] = _approved;
        emit Approval(
            owner,
            _approved,
            _tokenId
        );
    }

    /// @notice Enable or disable approval for a third party ("operator") to manage
    ///         all of `msg.sender`'s assets
    /// @dev Emits the ApprovalForAll event. The contract MUST allow
    ///      multiple operators per owner.
    /// @param _operator Address to add to the set of authorized operators
    /// @param _approved True if the operator is approved, false to revoke approval
    function setApprovalForAll(address _operator, bool _approved)
    override
    external
    {
        require(_operator != msg.sender, "ERC721: approve to caller");

        operatorApprovals[msg.sender][_operator] = _approved;
        emit ApprovalForAll(
            msg.sender,
            _operator,
            _approved
        );
    }

    /// @notice Count all NFTs assigned to an owner
    /// @dev NFTs assigned to the zero address are considered invalid, and this
    ///      function throws for queries about the zero address.
    /// @param _owner An address for whom to query the balance
    /// @return The number of NFTs owned by `_owner`, possibly zero
    function balanceOf(address _owner)
    override
    external
    view
    returns (uint256)
    {
        require(
            _owner != address(0),
            "ERC721: owner query for nonexistent token"
        );
        return ownerToThunderEggId[_owner] != 0 ? 1 : 0;
    }

    /// @notice Transfer ownership of an NFT -- THE CALLER IS RESPONSIBLE
    ///         TO CONFIRM THAT `_to` IS CAPABLE OF RECEIVING NFTS OR ELSE
    ///         THEY MAY BE PERMANENTLY LOST
    /// @dev Throws unless `msg.sender` is the current owner, an authorized
    ///      operator, or the approved address for this NFT. Throws if `_from` is
    ///      not the current owner. Throws if `_to` is the zero address. Throws if
    ///      `_tokenId` is not a valid NFT.
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    )
    override
    public
    {
        require(
            _to != address(0),
            "ERC721_ZERO_TO_ADDRESS"
        );

        address owner = ownerOf(_tokenId);
        require(
            _from == owner,
            "ERC721_OWNER_MISMATCH"
        );

        address spender = msg.sender;
        address approvedAddress = getApproved(_tokenId);
        require(
            spender == owner ||
            isApprovedForAll(owner, spender) ||
            approvedAddress == spender,
            "ERC721_INVALID_SPENDER"
        );

        if (approvedAddress != address(0)) {
            approvals[_tokenId] = address(0);
        }

        thunderEggIdToOwner[_tokenId] = _to;
        ownerToThunderEggId[_from] = 0;
        ownerToThunderEggId[_to] = _tokenId;

        emit Transfer(
            _from,
            _to,
            _tokenId
        );
    }

    /// @notice Find the owner of an NFT
    /// @dev NFTs assigned to zero address are considered invalid, and queries
    ///      about them do throw.
    /// @param _tokenId The identifier for an NFT
    /// @return The address of the owner of the NFT
    function ownerOf(uint256 _tokenId)
    override
    public
    view
    returns (address)
    {
        address owner = thunderEggIdToOwner[_tokenId];
        require(
            owner != address(0),
            "ERC721: owner query for nonexistent token"
        );
        return owner;
    }

    /// @notice Get the approved address for a single NFT
    /// @dev Throws if `_tokenId` is not a valid NFT.
    /// @param _tokenId The NFT to find the approved address for
    /// @return The approved address for this NFT, or the zero address if there is none
    function getApproved(uint256 _tokenId)
    override
    public
    view
    returns (address)
    {
        require(thunderEggIdToOwner[_tokenId] != address(0), "ERC721: approved query for nonexistent token");
        return approvals[_tokenId];
    }

    /// @notice Query if an address is an authorized operator for another address
    /// @param _owner The address that owns the NFTs
    /// @param _operator The address that acts on behalf of the owner
    /// @return True if `_operator` is an approved operator for `_owner`, false otherwise
    function isApprovedForAll(address _owner, address _operator)
    override
    public
    view
    returns (bool)
    {
        return operatorApprovals[_owner][_operator];
    }
}