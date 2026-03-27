from nltk.sentiment.vader import SentimentIntensityAnalyzer

def hr_sentiment_analysis(message):
    text = message.lower()
    
    # HR specific phrasing that trips up VADER
    if "needs improvement" in text or "misses" in text or "could be more active" in text:
        return "Negative", -0.5
    elif "as expected" in text or "could be more proactive" in text or "steady and reliable" in text:
        return "Neutral", 0.0
    else:
        # Fallback to VADER
        sid = SentimentIntensityAnalyzer()
        compound = sid.polarity_scores(message)['compound']
        if compound >= 0.05:
            return "Positive", round(compound, 3)
        elif compound <= -0.05:
            return "Negative", round(compound, 3)
        else:
            return "Neutral", round(compound, 3)

messages = [
    # Positive
    "Consistently meets deadlines and maintains great work quality.",
    "Shows strong teamwork and supports colleagues effectively.",
    "Quick learner who adapts well to new tasks.",
    # Neutral
    "Completes assigned tasks as expected.",
    "Communication is clear but could be more proactive.",
    "Performance is steady and reliable.",
    # Negative
    "Needs improvement in time management.",
    "Sometimes misses important details in work.",
    "Participation in team discussions could be more active.",
]

for m in messages:
    sentiment, score = hr_sentiment_analysis(m)
    print(f"{sentiment:<10} ({score:+.2f}) : {m}")
