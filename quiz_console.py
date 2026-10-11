"""
EventHub Quiz Console Application
Implements the exact Functional & Non-Functional specifications from the Quiz SRS Document:
- Accept user input (A, B, C, D)
- Validate input with re-prompts
- Track running score
- Immediate feedback with correct answer reveal
- Final result display with score and percentage
- Welcome message & rules
- List of Dictionaries question structure
- Core functions: main(), display_question(question_data), check_answer(user_answer, correct_answer)
"""

import sys

# List of Dictionaries data structure as specified in SRS Page 2
quiz_questions = [
    {
        "question": "Which JavaScript mapping library is lightweight and requires no API key or billing?",
        "options": ["A. Google Maps", "B. Leaflet.js", "C. Mapbox Commercial", "D. Apple Maps"],
        "correct": "B",
        "explanation": "Leaflet.js is open-source, ultra-lightweight (~40KB), and free without billing restrictions."
    },
    {
        "question": "What is the primary purpose of the EventHub platform?",
        "options": ["A. Online Food Delivery", "B. Event Discovery, Booking & Live Engagement", "C. Flight Ticketing", "D. Video Streaming"],
        "correct": "B",
        "explanation": "EventHub connects attendees with cultural, tech, sports, and music events."
    },
    {
        "question": "Which HTTP status code signifies that a resource was successfully created?",
        "options": ["A. 200 OK", "B. 201 Created", "C. 404 Not Found", "D. 500 Server Error"],
        "correct": "B",
        "explanation": "HTTP 201 Created indicates the request succeeded and led to resource creation."
    },
    {
        "question": "In relational database design, which key enforces referential integrity between tables?",
        "options": ["A. Candidate Key", "B. Foreign Key", "C. Composite Key", "D. Alternate Key"],
        "correct": "B",
        "explanation": "Foreign keys link records between parent and child tables (e.g., event_id in registrations)."
    },
    {
        "question": "What is the standard distance of an international full marathon race?",
        "options": ["A. 21.1 km", "B. 42.195 km", "C. 35.0 km", "D. 50.0 km"],
        "correct": "B",
        "explanation": "The standard marathon distance is 42.195 kilometers (26 miles 385 yards)."
    }
]

def display_question(question_data, question_number, total_questions):
    """Displays question text and options to the console."""
    print("\n" + "=" * 65)
    print(f"QUESTION {question_number} OF {total_questions}:")
    print(question_data["question"])
    print("-" * 65)
    for option in question_data["options"]:
        print(f"  {option}")
    print("-" * 65)

def check_answer(user_answer, correct_answer):
    """Checks whether the user answer matches the correct option."""
    return user_answer.strip().upper() == correct_answer.strip().upper()

def get_validated_input():
    """Prompts and validates that input is strictly A, B, C, or D as required by SRS."""
    valid_options = ["A", "B", "C", "D"]
    while True:
        choice = input("Enter your answer (A, B, C, or D): ").strip().upper()
        if choice in valid_options:
            return choice
        print(">> [Invalid Input]: Please enter only A, B, C, or D.")

def main():
    """Main application loop coordinating quiz flow and results."""
    print("=" * 65)
    print("        WELCOME TO EVENTHUB LIVE QUIZ & TRIVIA ARENA        ")
    print("=" * 65)
    print("RULES:")
    print(" 1. Read each question carefully.")
    print(" 2. Type A, B, C, or D and press Enter.")
    print(" 3. Immediate feedback will be displayed after each question.")
    print(" 4. Final score and percentage will be calculated at the end.")
    print("=" * 65)
    input("Press [Enter] to start the quiz...")

    score = 0
    total = len(quiz_questions)

    for index, q in enumerate(quiz_questions, start=1):
        display_question(q, index, total)
        user_choice = get_validated_input()

        if check_answer(user_choice, q["correct"]):
            print(f"\n[CORRECT!] Excellent work! +10 Points.")
            score += 1
        else:
            print(f"\n[INCORRECT!] The correct answer was: {q['correct']}")
            print(f"Explanation: {q['explanation']}")

    # Final Results as per SRS
    percentage = (score / total) * 100
    print("\n" + "=" * 65)
    print("                    QUIZ COMPLETED                    ")
    print("=" * 65)
    print(f" Total Questions : {total}")
    print(f" Correct Answers : {score}")
    print(f" Final Score     : {score * 10} / {total * 10}")
    print(f" Percentage      : {percentage:.1f}%")
    print("-" * 65)
    if percentage >= 80:
        print("Performance: OUTSTANDING! You earned the EventHub Gold Trivia Badge!")
    elif percentage >= 50:
        print("Performance: GOOD EFFORT! You qualify for a 10% Event Discount Voucher.")
    else:
        print("Performance: NICE TRY! Explore more events on EventHub to expand your knowledge!")
    print("=" * 65 + "\n")

if __name__ == "__main__":
    main()
