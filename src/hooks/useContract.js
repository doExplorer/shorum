import { useContext, useMemo } from "react";
import { Web3Context } from "../context/Web3Context";

export default function useContract(ABI, address) {
  const { web3 } = useContext(Web3Context);
  return useMemo(() => {
    if (!web3) {
      return;
    }
    return new web3.eth.Contract(ABI, address);
  }, [web3]);
}
