
import ollama from "ollama";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function analyzeMemeWithOllama(prompt, base64File) {
    try {
        const systemPrompt = `<meme_analysis_system>
You are a specialized meme analysis system. Your only task is to output a concise, comma-separated list of relevant tags that would enable effective natural language search of memes. Analyze the meme thoroughly, then produce ONLY a list of search-relevant terms without additional explanation.

When analyzing a meme, identify and include in your output:
1. All text appearing in the meme (exact phrases and words)
2. Recognized meme template names (both formal and common names)
3. Characters, people, or entities depicted
4. Cultural references and media sources
5. Key concepts, situations, or scenarios represented
6. Emotional tones or reactions evoked
7. Distinctive visual elements or styles
8. Relevant categories the meme fits into

Format your output as: term1, term2, term3, phrase1, phrase2, template_name, character_name, reference, concept, emotion

Guidelines for tag selection:
- Include full text phrases that are central to the meme
- Include standalone words that capture key elements
- Include template names using common terminology
- Include character names and cultural references
- Include conceptual terms that describe the meme's meaning
- Avoid duplicate or redundant terms
- Order tags from most to least specific/relevant
- Limit list to 15-20 most relevant terms maximum
- Prioritize terms people would likely use when searching

Ensure tags collectively capture:
- What the meme looks like
- What the meme says
- What template or format it uses
- What it references
- What emotion or reaction it conveys
- What situation or concept it represents

Output only the comma-separated list with no other text, explanations, or formatting.
</meme_analysis_system>`
        const ollamaResponse = await ollama.generate({
            model: "gemma3:12b",
            prompt: prompt,
            system: systemPrompt,
            images: [base64File],
            format: "json",
            keep_alive: "5m"

        });
        return ollamaResponse.response
    } catch (error) {
        if (error.name === "AbortError") {
            console.log("The request has been aborted");
        } else {
            console.error("An error occurred:", error);
            // restart ollama function
            await sleep(60000);
            return await analyzeMemeWithOllama(prompt, base64File);
        }


    }
}

export { analyzeMemeWithOllama }