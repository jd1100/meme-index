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


async function searchTypesense(searchQuery, email) {

    let user_email = email
    
    let searchParameters = {
        q: searchQuery,
        query_by: "imageDescription,imageAudioTranscribed",
        per_page: "20",
        // other options we can user to refine results
        'filter_by' : 'user:' + user_email
        // 'sort_by'   : 'num_employees:desc'
    };

    console.log(searchParameters);


    const searchResults = typesenseClient
        .collections("memes")
        .documents()
        .search(searchParameters);

    return searchResults;
}
export { searchTypesense }