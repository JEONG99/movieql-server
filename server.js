import { ApolloServer } from "apollo-server";
import { gql } from "graphql-tag";
import fetch from "node-fetch";

let tweets = [
  {
    id: "1",
    text: "first tweet!",
    userId: "2",
  },
  {
    id: "2",
    text: "second tweet!",
    userId: "1",
  },
];

let users = [
  {
    id: "1",
    firstName: "BH",
    lastName: "Jeong",
  },
  {
    id: "2",
    firstName: "YW",
    lastName: "Oh",
  },
];

const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    fullName: String!
  }
  type Tweet {
    id: ID!
    text: String!
    author: User
  }
  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String]!
    summary: String
    description_full: String!
    synopsis: String
    yt_trailer_code: String!
    language: String!
    background_image: String!
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
  }
  type Query {
    allMovies: [Movie!]!
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    movie(id: String!): Movie
  }
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet!
    deleteTweet(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    allUsers: () => users,
    allTweets: () => tweets,
    allMovies: async () => {
      return await fetch("https://yts.mx/api/v2/list_movies.json")
        .then((res) => res.json())
        .then((json) => json.data.movies);
    },
    movie: async (_, { id }) => {
      return await fetch(
        `https://yts.mx/api/v2/movie_details.json?movie_id=${id}`
      )
        .then((r) => r.json())
        .then((json) => json.data.movie);
    },
    tweet: (_, { id }) => tweets.find((tweet) => tweet.id === id),
  },
  Mutation: {
    postTweet: (_, { text, userId }) => {
      const newTweet = { id: tweets.length + 1, text, userId };
      tweets.push(newTweet);
      return newTweet;
    },
    deleteTweet: (_, { id }) => {
      const tweet = tweets.find((tweet) => tweet.id === id);
      if (!tweet) return false;
      tweets = tweets.filter((tweet) => tweet.id !== id);
      return true;
    },
  },
  User: {
    fullName: ({ firstName, lastName }) => `${firstName} ${lastName}`,
  },
  Tweet: {
    author: ({ userId }) => users.find((user) => user.id === userId),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});
