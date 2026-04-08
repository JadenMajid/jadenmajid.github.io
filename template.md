---
layout: post
title: "Template Post Title"
date: YYYY-MM-DD
thumbnail: "/images/icon.png"
repo: "https://github.com/yourusername/repo"
tags: [example, template]
math: true
---

## Introduction
This is a template blog post showcasing all the features available.

---

## 1. Images

<div style="text-align: center; margin: 2rem 0;">
    <img src="{{ '/images/icon.png' | relative_url }}" alt="Description" class="pixel-img" style="max-width: 100%; height: auto; border: 2px solid var(--win-border-dark);">
    <p style="font-size: 0.9rem; opacity: 0.7; margin-top: 0.5rem;">Fig 1: A pixelated icon example.</p>
</div>

Standard markdown images also work:
![Alt text]({{ '/images/icon.png' | relative_url }})

---

## 2. Callouts

<div class="callout info">
    <span class="callout-title">Info</span>
    This is an information callout. Use it for general tips or background info.
</div>

<div class="callout warning">
    <span class="callout-title">Warning</span>
    This is a warning callout. Use it for things to be careful about.
</div>

<div class="callout important">
    <span class="callout-title">Important</span>
    This is an important callout. Use it for critical information.
</div>

---

## 3. Math Notation (LaTeX)
Set `math: true` in the front matter to enable LaTeX support.

### Inline Math
You can write math inline like this: $E = mc^2$.

### Block Math
For more complex equations, use double dollar signs:

$$
\int_{a}^{b} f(x) dx = F(b) - F(a)
$$

Another example with a matrix:

$$
\begin{bmatrix}
1 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1
\end{bmatrix}
$$

---

## 4. Code Blocks
Standard markdown code blocks are styled for the theme.

```python
def hello_world():
    print("Hello, world!")
```

---

## 5. Repository Links
The "Source Code" button will automatically appear next to the title if you provide a `repo` URL in the front matter.
