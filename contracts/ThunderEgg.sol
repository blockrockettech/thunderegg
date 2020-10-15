// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/introspection/ERC165.sol";
import "./interfaces/IERC721Token.sol";
import "./interfaces/IERC721Receiver.sol";

import "./LavaToken.sol";

import "./libs/Strings.sol";
import "./libs/Godable.sol";

// In the fertile sacred grove under the lightning tree ThunderEggs are spawned!
//
// Note that it's ownable and the owner wields tremendous power.
//
// Don't mess with the Gods especially the God of Thunder!
contract ThunderEgg is Godable, IERC721Token, ERC165 {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // ** Chef

    // Info of each ThunderEgg.
    struct ThunderEggInfo {
        uint256 amount;     // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
        //
        // We do some fancy math here. Basically, any point in time, the amount of lava entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * pool.accLavaPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
        //   1. The pool's `accLavaPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }

    // Info of each pool.
    struct PoolInfo {
        IERC20 lpToken;           // Address of LP token contract.
        uint256 allocPoint;       // How many allocation points assigned to this pool. lavas to distribute per block.
        uint256 lastRewardBlock;  // Last block number that lavas distribution occurs.
        uint256 accLavaPerShare; // Accumulated lava per share, times 1e18. See below.
        uint256 totalSupply; // max ThunderEggs for this pool
        uint256 maxSupply; // max ThunderEggs for this pool
        uint256 endBlock; // god has spoken - this pool is 'ova
    }

    // The lavaToken TOKEN!
    LavaToken public lava;

    // Block number when bonus period ends.
    uint256 public bonusEndBlock;

    // Lava tokens created per block.
    uint256 public lavaPerBlock;

    // Bonus muliplier for early makers.
    uint256 public constant BONUS_MULTIPLIER = 10;

    // Info of each pool.
    PoolInfo[] public poolInfo;

    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(uint256 => ThunderEggInfo)) public thunderEggInfoMapping;

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

    // Mapping of tokenId => owner
    mapping(uint256 => address) internal thunderEggIdToOwner;
    mapping(uint256 => uint256) internal thunderEggIdToBirth;
    mapping(uint256 => bytes32) internal thunderEggIdToName;
    mapping(address => uint256) internal ownerToThunderEggId;

    // Mapping of tokenId => approved address
    mapping(uint256 => address) internal approvals;

    // Mapping of owner => operator => approved
    mapping(address => mapping(address => bool)) internal operatorApprovals;

    // ** end ERC721

    constructor(
        LavaToken _lava,
        uint256 _lavaPerBlock,
        uint256 _startBlock,
        uint256 _bonusEndBlock
    ) public {
        lava = _lava;
        lavaPerBlock = _lavaPerBlock;
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
    function addToPools(uint256 _allocPoint, IERC20 _lpToken, bool _withUpdate) public onlyGod {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(PoolInfo({
            lpToken : _lpToken,
            allocPoint : _allocPoint,
            lastRewardBlock : lastRewardBlock,
            accLavaPerShare : 0,
            totalSupply: 0,
            maxSupply: 999,
            endBlock: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
            }));
    }

    // Update the given pool's allocation point. Can only be called by the owner.
    function set(uint256 _pid, uint256 _allocPoint, bool _withUpdate) public onlyGod {
        if (_withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(_allocPoint);
        poolInfo[_pid].allocPoint = _allocPoint;
    }

    function end(uint256 _pid, uint256 _endBlock, bool _withUpdate) public onlyGod {
        require(_endBlock > block.number, "must be in the near future...sometime");

        PoolInfo storage pool = poolInfo[_pid];
        pool.endBlock = _endBlock;

        if (_withUpdate) {
            massUpdatePools();
        }
    }

    // Return reward multiplier over the given _from to _to block.
    function getMultiplier(uint256 _from, uint256 _to) public view returns (uint256) {
        if (_to <= bonusEndBlock) {
            return _to.sub(_from).mul(BONUS_MULTIPLIER);
        } else if (_from >= bonusEndBlock) {
            return _to.sub(_from);
        } else {
            return bonusEndBlock.sub(_from).mul(BONUS_MULTIPLIER).add(_to.sub(bonusEndBlock));
        }
    }

    function thunderEggStats(uint256 _pid, uint256 _tokenId) external view returns (address _owner, uint256 _birth, uint256 _lp, uint256 _lava) {
        if (!_exists(_tokenId)) {
            return (address(0x0), 0, 0, 0);
        }

        ThunderEggInfo storage info = thunderEggInfoMapping[_pid][_tokenId];

        return (thunderEggIdToOwner[_tokenId], thunderEggIdToBirth[_tokenId], info.amount, _calculatePendingLava(_pid, _tokenId));
    }

    // View function to see pending SUSHIs on frontend.
    function pendingLava(uint256 _pid, uint256 _tokenId) external view returns (uint256) {
        // no ThunderEgg, no lava!
        if (!_exists(_tokenId)) {
            return 0;
        }

        return _calculatePendingLava(_pid, _tokenId);
    }


    function _calculatePendingLava(uint256 _pid, uint256 _tokenId) internal view returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        ThunderEggInfo storage info = thunderEggInfoMapping[_pid][_tokenId];

        uint256 accLavaPerShare = pool.accLavaPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number <= pool.endBlock ? block.number : pool.endBlock);
            uint256 lavaReward = multiplier.mul(lavaPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
            accLavaPerShare = accLavaPerShare.add(lavaReward.mul(1e12).div(lpSupply));
        }

        return info.amount.mul(accLavaPerShare).div(1e12).sub(info.rewardDebt);
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

        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number <= pool.endBlock ? block.number : pool.endBlock);
        uint256 lavaReward = multiplier.mul(lavaPerBlock).mul(pool.allocPoint).div(totalAllocPoint);

        lava.mint(address(this), lavaReward);

        pool.accLavaPerShare = pool.accLavaPerShare.add(lavaReward.mul(1e18).div(lpSupply));
        pool.lastRewardBlock = block.number;
    }

    // Deposit LP tokens, mint the ThunderEgg and set allocations...
    function deposit(uint256 _pid, uint256 _amount, bytes32 _name) public {
        require(ownerToThunderEggId[msg.sender] == 0, "Thor has already blessed you with a ThunderEgg!");

        updatePool(_pid);

        // Thunder 🥚 time!
        uint256 tokenId = _mint(_pid, msg.sender, _name);

        PoolInfo storage pool = poolInfo[_pid];
        ThunderEggInfo storage info = thunderEggInfoMapping[_pid][tokenId];

        // credit the staked amount
        if (_amount > 0) {
            pool.lpToken.safeTransferFrom(address(msg.sender), address(this), _amount);
            info.amount = info.amount.add(_amount);
        }

        info.rewardDebt = info.amount.mul(pool.accLavaPerShare).div(1e18);
        emit Deposit(msg.sender, _pid, _amount);
    }

    // Withdraw LP tokens from MasterChef.
    function withdraw(uint256 _pid) public {

        uint256 tokenId = ownerToThunderEggId[msg.sender];
        require(tokenId != 0, "No ThunderEgg!");

        updatePool(_pid);

        PoolInfo storage pool = poolInfo[_pid];
        ThunderEggInfo storage info = thunderEggInfoMapping[_pid][tokenId];

        // burn the token - send all rewards and LP back!
        _burn(_pid, tokenId);

        // pay out rewards from the ThunderEgg
        uint256 pending = info.amount.mul(pool.accLavaPerShare).div(1e18).sub(info.rewardDebt);
        if (pending > 0) {
            safeLavaTransfer(msg.sender, pending);
        }

        // send all LP back...
        pool.lpToken.safeTransfer(address(msg.sender), info.amount);

        info.rewardDebt = info.amount.mul(pool.accLavaPerShare).div(1e18);
        emit Withdraw(msg.sender, _pid, info.amount);
    }

    // Safe sushi transfer function, just in case if rounding error causes pool to not have enough SUSHIs.
    function safeLavaTransfer(address _to, uint256 _amount) internal {
        uint256 lavaBal = lava.balanceOf(address(this));
        if (_amount > lavaBal) {
            lava.transfer(_to, lavaBal);
        } else {
            lava.transfer(_to, _amount);
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

    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory _data) private returns (bool) {
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

        return true;
    }

    function setBaseTokenURI(string calldata _uri) external onlyGod {
        baseTokenURI = _uri;
    }

    function setName(uint256 _tokenId, bytes32 _name) external onlyGod {
        thunderEggIdToName[_tokenId] = _name;
    }

    function _mint(uint256 _pid, address _to, bytes32 _name) internal returns (uint256) {
        require(_to != address(0), "ERC721: mint to the zero address");

        PoolInfo storage pool = poolInfo[_pid];
        require(pool.totalSupply.add(1) <= pool.maxSupply, "No more ThunderEggs!");

        tokenPointer = tokenPointer.add(1);
        uint256 tokenId = tokenPointer;

        // Mint
        thunderEggIdToOwner[tokenId] = _to;
        ownerToThunderEggId[msg.sender] = tokenId;

        // birth
        thunderEggIdToBirth[tokenId] = block.number;

        // name
        thunderEggIdToName[tokenId] = _name;

        // MetaData
        pool.totalSupply = pool.totalSupply.add(1);

        // Single Transfer event for a single token
        emit Transfer(address(0), _to, tokenId);

        return tokenId;
    }

    function exists(uint256 _tokenId) external view returns (bool) {
        return _exists(_tokenId);
    }

    function _exists(uint256 _tokenId) internal view returns (bool) {
        return thunderEggIdToOwner[_tokenId] != address(0);
    }

    function tokenURI(uint256 _tokenId) external view returns (string memory) {
        require(_exists(_tokenId), "must exist");
        return Strings.strConcat(baseTokenURI, Strings.uint2str(_tokenId));
    }

    function _burn(uint256 _pid, uint256 _tokenId) internal {
        require(_exists(_tokenId), "must exist");

        address owner = thunderEggIdToOwner[_tokenId];

        require(owner == msg.sender, "Must own the egg!");
        require(owner != address(0), "ERC721_ZERO_OWNER_ADDRESS");

        PoolInfo storage pool = poolInfo[_pid];

        thunderEggIdToOwner[_tokenId] = address(0);
        ownerToThunderEggId[msg.sender] = 0;

        pool.totalSupply = pool.totalSupply.sub(1);

        emit Transfer(
            owner,
            address(0),
            _tokenId
        );
    }

    function safeTransferFrom(address _from, address _to, uint256 _tokenId) override public {
        safeTransferFrom(_from, _to, _tokenId, "");
    }

    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes memory _data) override public {
        transferFrom(_from, _to, _tokenId);
        require(_checkOnERC721Received(_from, _to, _tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
    }

    function approve(address _approved, uint256 _tokenId) override external {
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

    function setApprovalForAll(address _operator, bool _approved) override external {
        require(_operator != msg.sender, "ERC721: approve to caller");

        operatorApprovals[msg.sender][_operator] = _approved;
        emit ApprovalForAll(
            msg.sender,
            _operator,
            _approved
        );
    }

    function balanceOf(address _owner) override external view returns (uint256) {
        require(_owner != address(0), "ERC721: owner query for nonexistent token");
        return ownerToThunderEggId[_owner] != 0 ? 1 : 0;
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) override public {
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

    function ownerOf(uint256 _tokenId) override public view returns (address) {
        require(_exists(_tokenId), "ERC721: owner query for nonexistent token");
        return thunderEggIdToOwner[_tokenId];
    }

    function getApproved(uint256 _tokenId) override public view returns (address) {
        require(_exists(_tokenId), "ERC721: approved query for nonexistent token");
        return approvals[_tokenId];
    }

    function isApprovedForAll(address _owner, address _operator) override public view returns (bool) {
        return operatorApprovals[_owner][_operator];
    }
}