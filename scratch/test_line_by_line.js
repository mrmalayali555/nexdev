const testCases = [
  {
    name: 'Raw text with single newline and inline sublist',
    text: `Daily Tech Briefing
1. Anthropic prepares for a potential $1.4 trillion IPO — one of the biggest tests of the AI boom
Anthropic is filing. Trailing twelve month revenue reached $4.8 billion with rapid acceleration in enterprise Claude adoption across Fortune 500 companies.
Key points:
1. Point one
2. Point two
3. Point three

2. Google DeepMind announces AlphaProof Code for formal verification
Google DeepMind has introduced AlphaProof Code, an AI-assisted framework that formally verified important security properties of compiled code.

3. China mandates AI curriculum in elementary schools nationwide
China has mandated artificial intelligence curriculum for all elementary and middle school students by 2027 to build long-term tech leadership.`
  },
  {
    name: 'Markdown headers without blank lines',
    text: `Daily Tech Briefing
## **1. Anthropic prepares for a potential $1.4 trillion IPO — one of the biggest tests of the AI boom**
Anthropic is filing for an initial public offering.
## **2. Google DeepMind announces AlphaProof Code for formal verification**
DeepMind is launching mathematical formal verification.
## **3. China mandates AI curriculum in elementary schools nationwide**
China is doing it nationwide.`
  },
  {
    name: 'Real User Briefing',
    text: `📰 Daily Tech & News Briefing
Monday, 16 November 2026
India & Global Edition · Morning Briefing
Today's five stories focus on a potentially historic AI stock-market listing, AI-assisted mathematical verification of secure software, China's nationwide AI education strategy, Kerala's latest startup developments and an upcoming national AI hackathon.

1. Anthropic prepares for a potential $1.4 trillion IPO — one of the biggest tests of the AI boom
[Anthropic & Claude: Why This AI Company Thinks Differently | INTIMEON | INTIMEON](https://images.openai.com/static-rsc-4/Rk5DOIZTN2XmyodKhdUt8U7O2IbcWGhk3gsY4rejWlsltUq9PYLVP6Zzm-pz2-ZO72VCU_vRvL0MJipxgdrR9uLs2HNUVU7I6zi2lptmQYDZMaftbPu4h78VvUN9HbQhq3gDNoqq9-W1TdDllFgbkZqgD5gdbfr4wbOARzXk0Qs?purpose=inline)
[intimeon.com](https://intimeon.com/blog/anthropic-claude-amsterdam-2026?lang=en&utm_source=chatgpt.com)
AI · Startups · Global finance
Latest prospectus: 10–11 November 2026
Anthropic, the company behind Claude, is preparing for a massive initial public offering (IPO) that could value it at approximately $1.4 trillion on a fully diluted basis.
According to Reuters, Anthropic is targeting a share price of $70–$78 and plans to sell approximately 825 million shares, potentially raising $64.4 billion through the public offering. Nasdaq trading is expected to begin on 19 November, under the ticker ANT.
Reuters+1
The financial picture: Anthropic reported $4.8 billion in trailing 12-month revenue with a 65% annualized growth rate.

2. Mathematicians and engineers put AI model AlphaProof to the test in formal verification
Google DeepMind has introduced AlphaProof Code, an AI-assisted framework that formally verified important security properties of the compiled code under test.
This is particularly significant because the system did more than scan code for suspicious patterns. It helped construct machine-checkable proofs using the Lean interactive theorem prover.

3. China mandates nationwide AI curriculum for elementary and secondary schools
Beijing has issued comprehensive guidelines requiring all primary and middle school students to receive foundational education in artificial intelligence by 2027.
The initiative is designed to build foundational computational literacy and national technological self-reliance from an early age.

4. Kerala startup ecosystem crosses 5,000 registered ventures
The Kerala Startup Mission announced that the southern Indian state has officially surpassed 5,000 registered startups across biotechnology, clean energy, and software services.
Funding in Kerala-based ventures grew 34% year-on-year, driven by angel networks and state co-investment schemes.

5. India announces National Generative AI Hackathon with $2M prize pool
The Ministry of Electronics and Information Technology (MeitY) has launched a nationwide competition aimed at building open-source AI solutions for Indian languages and agriculture.
Over 50,000 developers and students are expected to compete across three elimination rounds beginning in December.`
  }
];

function splitStoriesLineByLine(rawText) {
  if (!rawText || !rawText.trim()) return [];
  const lines = rawText.split(/\r?\n/);

  // Pattern for a line that starts with a number like "1. Title", "## 1. Title", "## **1. Title**"
  const linePattern = /^(?:#{1,4}\s*)?(?:\*{1,2})?\s*(\d{1,2})\s*[.)]\s*(?:\*{1,2})?\s*(.*)$/;

  const candidates = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const match = rawLine.match(linePattern);
    if (!match) continue;

    const num = parseInt(match[1], 10);
    let title = match[2]
      .replace(/\*{1,2}/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/^[#*_`\s]+|[#*_`\s]+$/g, '')
      .trim();

    // Check previous non-empty line
    let prevNonEmptyLine = '';
    let hasBlankLineBefore = false;
    for (let j = i - 1; j >= 0; j--) {
      if (!lines[j].trim()) {
        hasBlankLineBefore = true;
      } else {
        prevNonEmptyLine = lines[j].trim();
        break;
      }
    }

    // A sublist item is introduced by a line ending with ':' OR is an immediate sibling without a blank line
    const isSublist = prevNonEmptyLine.endsWith(':') || (!hasBlankLineBefore && /^(?:#{1,4}\s*)?(?:\*{1,2})?\s*\d{1,2}\s*[.)]/.test(prevNonEmptyLine));

    if (title.length < 15) continue;
    if (num < 1 || num > 25) continue;
    if (/^[\d$₹€£¥]/.test(title)) continue;
    if (/^\|/.test(title)) continue;
    if (/^https?:\/\//.test(title)) continue;
    if (isSublist) continue;

    candidates.push({ lineIndex: i, num, title });
  }

  // Filter for sequential numbers starting from 1
  const stories = [];
  let expectedNext = 1;

  for (const c of candidates) {
    if (c.num === expectedNext) {
      stories.push(c);
      expectedNext = c.num + 1;
    }
  }

  // Build story chunks
  if (stories.length >= 2) {
    const result = [];
    for (let i = 0; i < stories.length; i++) {
      const current = stories[i];
      const next = stories[i + 1];
      const startLine = current.lineIndex;
      const endLine = next ? next.lineIndex : lines.length;

      const chunk = lines.slice(startLine, endLine).join('\n').trim();
      const chunkLines = chunk.split('\n').map(l => l.trim()).filter(Boolean);

      // Extract category
      let category = 'Technology';
      for (const line of chunkLines.slice(1, 8)) {
        if ((line.includes('·') || line.includes('•')) && !line.startsWith('#') && !line.startsWith('!') && !line.startsWith('[') && line.length < 80 && line.length > 3) {
          category = line.replace(/[*_#`]/g, '').trim();
          break;
        }
      }

      // Extract summary
      let summary = '';
      for (const line of chunkLines.slice(1)) {
        if (!line.startsWith('#') && !line.startsWith('[') && !line.startsWith('!') && !line.startsWith('|') && !line.startsWith('-') && !line.startsWith('>') && line !== category && !line.includes('·') && !line.includes('•') && line.length > 30) {
          summary = line.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_#`]/g, '').trim();
          if (summary.length > 220) summary = summary.slice(0, 217) + '...';
          break;
        }
      }

      const urlMatch = chunk.match(/https?:\/\/[^\s)"'<>]+/);

      result.push({
        title: current.title,
        category: category || 'Technology',
        summary: summary || current.title,
        fullContent: chunk,
        sourceUrl: urlMatch ? urlMatch[0] : undefined,
      });
    }
    return result;
  }

  return [];
}

for (const tc of testCases) {
  console.log(`\n=== Test: ${tc.name} ===`);
  const stories = splitStoriesLineByLine(tc.text);
  console.log(`Found ${stories.length} stories:`);
  stories.forEach((s, i) => console.log(`  Story ${i+1}: ${s.title} [Cat: ${s.category}]`));
}

