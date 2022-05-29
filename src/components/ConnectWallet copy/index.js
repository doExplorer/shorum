import React, { useEffect, useState, useContext } from "react";
import NetworkModal from "components/NetworkModal";
import { Web3Context } from "context/Web3Context";
import config, { chainIdMapping } from "config";
import "./style.scss";

export default function ConnectWallet() {
  const { connectWallet, chainId } = useContext(Web3Context);
  const [networkError, setNetworkError] = useState("");

  // useEffect(() => {
  //   window.addEventListener("ethereum#initialized", connectWallet, {
  //     once: true,
  //   });

  //   if (window.ethereum) {
  //     window.ethereum.on("accountsChanged", (accounts) => {
  //       connectWallet();
  //       window.location.reload();
  //     });

  //     window.ethereum.on("chainChanged", (chainId) => {
  //       connectWallet();
  //       window.location.reload();
  //     });
  //   }
  // }, []);

  // const connectWallet = () => {
  //   if (window.ethereum) {
  //     const configChainId = config.chainId;
  //     const walletChainId = parseInt(
  //       window.ethereum ? window.ethereum.chainId : ""
  //     );

  //     if (
  //       walletChainId &&
  //       !isNaN(walletChainId) &&
  //       configChainId !== walletChainId
  //     ) {
  //       setNetworkError(
  //         `${chainIdMapping[configChainId]}, your wallet is ${
  //           chainIdMapping[walletChainId] ?? walletChainId
  //         }`
  //       );
  //     } else {
  //       setNetworkError("");
  //     }

  //     if (wallet && wallet.status !== "connected") {
  //       wallet.connect();
  //     }
  //   } else {
  //     alert("Wallet not found on your device");
  //   }
  // };

  // check network
  useEffect(() => {
    const configChainId = config.chainId;

    if (chainId && !isNaN(chainId) && configChainId !== chainId) {
      setNetworkError(
        `${chainIdMapping[configChainId]}, your wallet is ${
          chainIdMapping[chainId] ?? chainId
        }`
      );
    } else {
      setNetworkError("");
    }
  }, [chainId]);

  return (
    <>
      <a className="btn-connect" onClick={connectWallet}>
        Connect Wallet
      </a>

      {networkError && (
        <NetworkModal
          networkError={networkError}
          onCancel={() => {
            setNetworkError("");
          }}
        />
      )}
    </>
  );
}
