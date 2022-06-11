import kp from "./keypair.json";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

// Solana Program Information
import idl from "./idl.json";

// solana web3 package
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
// anchor package
import {
  Program,
  AnchorProvider as Provider,
  web3,
} from "@project-serum/anchor";

const { SystemProgram, Keypair } = web3;
// keypair
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

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

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programId, provider);
      console.log("ping");
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "Created new BaseAccount with address",
        baseAccount.publicKey.toString()
      );
      await getGifList();
    } catch (error) {
      console.log("Error in createGifAccount:-", error);
    }
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
    // if (inputValue.length > 0) {
    //   console.log("Gif Link:-", inputValue);

    //
    //   setInputValue("");
    // } else {
    //   alert("Empty Input, try again.");
    // }

    if (inputValue == 0) {
      alert("No Gif Link Given!");
      return;
    }
    // setGifList([...gifList, inputValue]);
    // setInputValue("");
    try {
      const provider = getProvider();
      const program = new Program(idl, programId, provider);
  
      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", inputValue)
  
      await getGifList();
    } catch (error) {
      console.log("Failed to Send GIF sendGif:-", error);
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
    console.log("gifList", gifList);
    if (gifList === null) {
      return (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createGifAccount}
          >
            Do One-Time initialization for GIF Program Account
          </button>
        </div>
      );
    } else {
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
            {gifList.map((item, index) => (
              <div className="gif-item" key={index}>
                <img src={item.gifLink} alt="gif" />
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  // getting data from solana blockchain
  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programId, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("Got the Account:-", account);
      const gifs = await account.gifList;
      setGifList(gifs);
    } catch (error) {
      setGifList(null);
      console.log("Error in getGifList:-", error);
    }
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
        // setGifList(TEST_GIFS);
        getGifList();
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
