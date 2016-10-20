const typeDefinitions = `
type President {
  name: String
  party: String
  term: String
}
type RootQuery {
  president(name: String, party: String, term: String): President
}
schema {
  query: RootQuery
}
`;

module.exports = [typeDefinitions];
