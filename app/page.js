"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [deckId, setDeckId] = useState("");
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  const cardValue = (value) => {
    if (["KING", "QUEEN", "JACK"].includes(value)) return 10;
    if (value === "ACE") return 11;
    return parseInt(value);
  };

  const calculateTotal = (cards) => {
    let total = 0;
    let aces = 0;
    cards.forEach((card) => {
      if (card.value === "ACE") aces++;
      total += cardValue(card.value);
    });
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  };

  const startGame = async () => {
    const res = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6");
    const data = await res.json();
    setDeckId(data.deck_id);
    drawInitialCards(data.deck_id);
    setGameOver(false);
    setMessage("");
  };

  const drawInitialCards = async (id) => {
    const res = await fetch(`https://deckofcardsapi.com/api/deck/${id}/draw/?count=4`);
    const data = await res.json();
    const player = [data.cards[0], data.cards[2]];
    const dealer = [data.cards[1], data.cards[3]];
    setPlayerCards(player);
    setDealerCards(dealer);
    setPlayerTotal(calculateTotal(player));
    setDealerTotal(calculateTotal(dealer));
  };

  const hit = async () => {
    const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
    const data = await res.json();
    const newCards = [...playerCards, data.cards[0]];
    setPlayerCards(newCards);
    const total = calculateTotal(newCards);
    setPlayerTotal(total);
    if (total > 21) {
      setMessage("You busted! Dealer wins.");
      setGameOver(true);
    }
  };

  const stand = async () => {
    let dealer = [...dealerCards];
    let total = calculateTotal(dealer);
    while (total < 17) {
      const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
      const data = await res.json();
      dealer.push(data.cards[0]);
      total = calculateTotal(dealer);
    }
    setDealerCards(dealer);
    setDealerTotal(total);
    determineWinner(total);
  };

  const determineWinner = (dealerScore) => {
    if (dealerScore > 21 || playerTotal > dealerScore) {
      setMessage("You win!");
    } else if (playerTotal < dealerScore) {
      setMessage("Dealer wins.");
    } else {
      setMessage("It's a tie!");
    }
    setGameOver(true);
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white p-8 flex flex-col items-center gap-8 font-poppins">
      <h1 className="text-4xl mb-6 text-shadow-md font-mono text-center">Munkhbayasgalan's Blackjack</h1>

      <button 
        onClick={startGame} 
        className="font-mono px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all duration-500 ease-in-out transform hover:scale-105"
      >
        New Game
      </button>

      <div className="w-full max-w-4xl mt-8 flex justify-between flex-wrap gap-6">

        <div className="w-full md:w-1/2 text-center">
          <h2 className="text-xl font-mono mb-4">Player ({playerTotal})</h2>
          <div className="flex justify-center gap-6 flex-wrap">
            {playerCards.map((card) => (
              <img 
                key={card.code} 
                src={card.image} 
                alt={card.code} 
                className="w-24 h-auto rounded-lg shadow-xl transform transition-transform duration-300 hover:scale-105" 
              />
            ))}
          </div>
        </div>

        {/* Dealer Cards Section */}
        <div className="w-full md:w-1/2 text-center mt-8">
          <h2 className="text-xl font-mono mb-4">Dealer ({gameOver ? dealerTotal : "?"})</h2>
          <div className="flex justify-center gap-6 flex-wrap">
            {dealerCards.map((card, index) => (
              <img
                key={card.code}
                src={index === 1 && !gameOver ? "https://www.deckofcardsapi.com/static/img/back.png" : card.image}
                alt={card.code}
                className="w-24 h-auto rounded-lg shadow-xl transform transition-transform duration-300 hover:scale-105"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hit and Stand Buttons */}
      {!gameOver && (
        <div className="mt-6 flex gap-6 justify-center">
          <button 
            onClick={hit} 
            className="font-mono px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all duration-500 ease-in-out transform hover:scale-105"
          >
            Hit
          </button>
          <button 
            onClick={stand} 
            className="font-mono px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-all duration-500 ease-in-out transform hover:scale-105"
          >
            Stand
          </button>
        </div>
      )}

      {/* Game Status Message */}
      {message && <h2 className="text-2xl mt-6 font-semibold font-mono text-shadow-md text-center">{message}</h2>}
    </div>
  );
}
