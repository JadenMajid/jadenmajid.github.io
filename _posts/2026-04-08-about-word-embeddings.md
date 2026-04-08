---
layout: post
title: "About Word Embeddings"
date: 2026-04-08
thumbnail: "/images/blog/wordembedding_difference.png"
tags: [machine-learning, ubc]
math: true
excerpt: "This was originally written as part of HW9 for CPSC 330, but was not included in my submission."
---

This was originally written as part of HW9 for CPSC 330, but was scrapped because it didn’t quite fit the requirements. I decided to post it for fun anyways because it was already written and I didn't want it to go to waste.
<br>

## The Good

Word embedding is a machine learning technique where words are projected into a fixed dimension space that encodes their semantic meaning. As a super simple example, consider some one dimensional embedding space that encodes the “positivity” of words. This super simple model takes words as input and outputs a single number from \-1 to 1\. In more formal terms (the model is f):

$$f: \mathbb{R}^d \to \mathbb{R}, \quad \mathbf{x} \mapsto f(\mathbf{x})$$

This model could some some encodings like the following:
<br>

| Word | f(Word) |
| :---- | :---- |
| ok | 0.2 |
| amazing | 0.8 |
| evil | \-0.9 |
| good | 0.6 |
| horse | 0.1 |
| sick | 0.0 |

The model has some dictionary of words it’s categorized previously, then outputs the embedding. We chose to give words like “sick” a neural score because of its double meanings of both “unwell” and “very cool”, which aren’t captured well by this super simple model.
<br><br>

<div style="text-align: center; margin: 2rem 0;">
    <img src="{{ '/images/blog/wordembedding_difference.png' | relative_url }}" alt="plot of word embeddings" class="pixel-img" style="max-width: 100%; height: auto; border: 2px solid var(--win-border-dark);">
    <p style="font-size: 0.9rem; opacity: 0.7; margin-top: 0.5rem;">Fig 1: The difference between vectors embeds analogous meanings between words.</p>
</div>

Consider some model that encodes some limited vocabulary of words with dimensions for gender and age. As shown in the above simplified figure (adapted from CMU), we can see that the difference between adult and boy is equal to the difference between woman and child. These distance vectors are useful for encoding the relationship between words. While the magnitude and direction of the vectors can be very hard to interpret, we can use these difference vectors to both find words with similar relationships and the ratio of two distances can reveal what words are more closely related. Additionally, we can find the words “closest” to a word. Here are some benign examples calculated.
<br>

| Word | Closest Word | Similarity Score |
| :---- | :---- | :---- |
| whale | whales | 80.3% |
| pepperoni | pizza | 67.5% |
| dubious | questionable | 76.8% |
| jacket | pants | 84.4% |

<br>

## The Bad

The difference vectors previously mentioned can also reveal biases in the training data. Modern models are “debiased” but by adding a distance vector to a word we can search for the closest words to the final position we can reveal some lingering biases. 
<br>

| Ranking | man : genius woman : ? |  | woman : caregiver man : ? |  | black : looter white : ? |  | white : literate black : ? |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | visionary | 55.8% | breadwinner | 54.1% | picketer | 57.2% | illiterate | 75.3% |
| 2 | beauty | 55.7% | caregiver | 54.0% | rioter | 53.0% | uneducated | 59.5% |
| 3 | obsession | 54.6% | bereavement | 54.0% | Knife- wielding | 52.7% | proficient | 58.9% |
| 4 | storyteller | 53.0% | carer | 53.9% | protestor | 49.6% | illiterates | 55.0% |

<br>
We can see clear biases associated with both gender and race in the above examples. The analogization in embedding space shows that the word embedding model preserves both racist and sexist biases present in training data text, even after “debiasing”.
<br><br>

## The Ugly

Biases in embeddings cause harm by creating latent space associations that affect the models trained on the embeddings. I think this part is pretty self evident, so I’m going to leave it at that.