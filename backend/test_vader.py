from nltk.sentiment.vader import SentimentIntensityAnalyzer

sid = SentimentIntensityAnalyzer()

messages = [
    "Consistently meets deadlines and maintains great work quality.",
    "Shows strong teamwork and supports colleagues effectively.",
    "Quick learner who adapts well to new tasks.",
    "Completes assigned tasks as expected.",
    "Communication is clear but could be more proactive.",
    "Performance is steady and reliable.",
    "Needs improvement in time management.",
    "Sometimes misses important details in work.",
    "Participation in team discussions could be more active.",
]

for msg in messages:
    scores = sid.polarity_scores(msg)
    c = scores['compound']
    label = "POS" if c >= 0.05 else "NEG" if c <= -0.05 else "NEU"
    print(f"{c:+.3f} {label} | {msg[:55]}")
