import random

SUITS = ["♠", "♥", "♦", "♣"]
RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
VALUES = {r: min(i + 2, 10) for i, r in enumerate(RANKS)}
VALUES["A"] = 11


def build_deck():
    return [f"{r}{s}" for s in SUITS for r in RANKS]


def card_value(card):
    return VALUES[card[:-1]]


def hand_total(hand):
    total = sum(card_value(c) for c in hand)
    aces = sum(1 for c in hand if c[:-1] == "A")
    while total > 21 and aces:
        total -= 10
        aces -= 1
    return total


def display_hand(label, hand, hide_second=False):
    if hide_second:
        print(f"{label}: {hand[0]} [?]")
    else:
        print(f"{label}: {' '.join(hand)} = {hand_total(hand)}")


def play():
    deck = build_deck()
    random.shuffle(deck)

    player = [deck.pop(), deck.pop()]
    dealer = [deck.pop(), deck.pop()]

    print("\n--- BLACKJACK ---\n")
    display_hand("Dealer", dealer, hide_second=True)
    display_hand("You   ", player)

    # Player turn
    while hand_total(player) < 21:
        move = input("\nHit or Stand? (h/s): ").strip().lower()
        if move == "h":
            player.append(deck.pop())
            display_hand("You   ", player)
        elif move == "s":
            break

    player_total = hand_total(player)
    if player_total > 21:
        print("\nBust! You lose.")
        return

    # Dealer turn (hits on soft 16 and below)
    print("\n--- Dealer reveals ---")
    display_hand("Dealer", dealer)
    while hand_total(dealer) < 17:
        dealer.append(deck.pop())
        display_hand("Dealer", dealer)

    dealer_total = hand_total(dealer)

    print("\n--- Result ---")
    if dealer_total > 21 or player_total > dealer_total:
        print("You win!")
    elif player_total < dealer_total:
        print("Dealer wins.")
    else:
        print("Push (tie).")


if __name__ == "__main__":
    while True:
        play()
        again = input("\nPlay again? (y/n): ").strip().lower()
        if again != "y":
            break
