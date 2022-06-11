import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

// Solana Program Information
import idl from "./idl.json";

// solana web3 package
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
// anchor package
import { Program, AnchorProvider as Provider, web3 } from "@project-serum/anchor";

import { SystemProgram, Keypair } from "@solana/web3.js";
let baseAccount = Keypair.generate();
const programId = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet");
const opts = {
  preflightCommitment: "processed",
};

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const TEST_GIFS = [
  "https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
  "https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g",
  "https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g",
  "https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp",
];

const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);
  const [gifList, setGifList] = useState([]);

  // getting provider
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const checkifWalletConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom Wallet Found!");

          const response = await solana.connect({ onlyIfTrusted: true });

          console.log(
            "Connected with PublicKey:",
            response.publicKey.toString()
          );

          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Solana Object not Found! Get a Phantom Wallet");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();

      console.log(
        "Connected with public key:- ",
        response.publicKey.toString()
      );

      setWalletAddress(response.publicKey.toString());
    }
  };

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log("Gif Link:-", inputValue);

      setGifList([...gifList, inputValue]);
      setInputValue("");
    } else {
      alert("Empty Input, try again.");
    }
  };

  const renderNotConnectedContainer = () => {
    return (
      <button
        className="cta-button connect-wallet-button"
        onClick={connectWallet}
      >
        Connect Phantom Wallet!
      </button>
    );
  };

  const renderConnectedContainer = () => {
    return (
      <div className="connected-container">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendGif();
          }}
        >
          <input
            type="text"
            placeholder="Enter Gif Link!"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button className="cta-button submit-gif-button">Submit</button>
        </form>

        <div className="gif-grid">
          {gifList.map((Gif) => (
            <div className="gif-item" key={Gif}>
              <img src={Gif} alt={Gif} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkifWalletConnected();
    };

    window.addEventListener("load", onLoad);

    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    (async () => {
      if (walletAddress) {
        setGifList(TEST_GIFS);
      }
    })();
  }, [walletAddress]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">Flower GIF</p>
          <p className="sub-text">
            View your Flower GIF collection in the metaverse ✨
          </p>
        </div>

        {!walletAddress && renderNotConnectedContainer()}
        {walletAddress && renderConnectedContainer()}

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
