import Replicate from "replicate";

let replicateApiToken = import.meta.env.REPLICATE_API_TOKEN;

let replicate = new Replicate({
    auth: replicateApiToken,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function analyzeMemeWithReplicate(prompt, imgBase64) {
    try {
        const _outputImageDescription = await replicate.run(
            "yorickvp/llava-v1.6-34b:510c16b590b7e32a1ccd905bd4df6a2873a760c7cb4fec6715c96353fa6e302d",
            {
                input: {
                    prompt: prompt,
                    image: "data:image/png;base64," + imgBase64,
                }
            }
        );
        // .replace(/(cartoon frog)/g, "pepe")
        const output = _outputImageDescription.join(",").replaceAll("\n", "").replaceAll(",", "")
        return output
    } catch (e) {
        console.log(e)
        sleep(30000).then(() => {
            foutputImageDescription(img)
        })
    }
}

export { analyzeMemeWithReplicate }