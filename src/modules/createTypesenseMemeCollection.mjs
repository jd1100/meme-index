import * as Typesense from "typesense";

let typesenseUrl = import.meta.env.TYPESENSE_NODE;
let typesenseApiToken = import.meta.env.TYPESENSE_API_KEY;
let typesensePort = import.meta.env.TYPESENSE_PORT;
let typesenseProtocol = import.meta.env.TYPESENSE_PROTOCOL;

let typesenseClient = new Typesense.Client({
    nodes: [
        {
            host: typesenseUrl, // For Typesense Cloud use xxx.a1.typesense.net
            port: typesensePort, // For Typesense Cloud use 443
            protocol: typesenseProtocol, // For Typesense Cloud use https
        },
    ],
    apiKey: typesenseApiToken,
    connectionTimeoutSeconds: 600,
});


async function CreateTypesenseMemeCollection() {
    let collectionCreationStatus
    let memesSchema = {
        'name': 'memes',
        'fields': [
            { 'name': 'imageDescription', 'type': 'string' },
            { 'name': 'embedding', 'type': 'string' },

            { 'name': 'imageAudioTranscribed', 'type': 'string' },
            { 'name': 'fileName', 'type': 'string' },
            { 'name': 'imagePath', 'type': 'string' }
        ],
    }

    typesenseClient.collections().create(memesSchema)
        .then(function (data) {
            collectionCreationStatus = data
            console.log(data)
        })
    return collectionCreationStatus
}
export { CreateTypesenseMemeCollection }