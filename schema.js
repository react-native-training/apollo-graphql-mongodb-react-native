const typeDefinitions = `
type Person {
  firstName: String
  lastName: String
}
type RootQuery {
  fortuneCookie: String
  views: String
  people(firstName: String, lastName: String): Person
}
schema {
  query: RootQuery
}
`;

module.exports = [typeDefinitions];