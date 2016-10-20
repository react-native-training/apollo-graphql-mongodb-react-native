# Apollo Server Example

This

#### Using Express + GraphQL + MongoDB + Express

To get setup:

Clone repository

`git clone git@github.com:dabit3/apollo-graphql-mongodb.git`

cd into repository

`cd apollo-graphql-mongodb`

Start MongoDB Server

`mongod`

Start project server

`node app.js`

Open GraphQL Explorer on http://localhost:8080/graphiql

// You may need to seed project with data //

From command line, open MongoDB

```
> mongo
> use views
> db.people.insert({ firstName: "Nader" })
> db.views.insert({ postId: 0, views: 10 })
```

# Apollo Client Example

## Coming Soon...