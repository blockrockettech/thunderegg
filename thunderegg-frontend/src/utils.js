export function getContractAddressFromConf(truffleConf, chainId) {
  if (!truffleConf || !chainId) return "";
  const { networks } = truffleConf;
  if (networks[chainId.toString()]) {
    const address = networks[chainId.toString()].address;
    return address ? address : "";
  }
  return "";
}
