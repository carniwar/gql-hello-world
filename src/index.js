import express from 'express';
import graphqlHTTP from 'express-graphql';
import {buildSchema} from 'graphql';

// curl -X POST -H "Content-Type: application/json" -d '{"query": "query personById($personId: Int!) { personById(id: $personId) {id,name} }", "variables": { "personId": 1 } }' http://localhost:4000/force

const schema = buildSchema(`
    type Query {
        personById(id: Int!): Person
        message: String
        random: Float!
        rollDice(numDice: Int!, numSides: Int): [Int]
        rollThreeDice: [Int]
    },
    type Person {
        id: Int
        name: String
        age: Int
        father: Person
    }
`);

let people = [];

const random = () => Math.random();

const rollDice = ({numDice, numSides}) => {
    let output = [];
    for (let i = 0; i < numDice; i++) {
        output.push(1 + Math.floor(random() * (numSides || 6)));
    }
    return output;
};

class Person {

    constructor(name, email, father) {
        this.update(name, email);
        this.father = father;
    }

    save() {
        this.id = people.length + 1;
        people.push(this);
    }

    age() {
        return Math.floor(random() * 100);
    }

    update(name, email) {
        this.name = name;
        this.email = email;
    }

}

const personById = ({id}) => {
    return people.filter(person => person.id == id)[0];
};

const root = {
    message: () => 'Hello World!',
    personById: personById,
    random: random,
    quoteOfTheDay: () => random() < 0.5 ? 'Take it easy' : 'Salvation lies within',
    rollDice: rollDice,
    rollThreeDice: () => rollDice({numDice: 3}),
};

const app = express();
app.use((req, res, next) => {
    console.log("IP request: " + req.ip + " at " + new Date());
    next();
});
app.use('/force', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

new Person("Vader", "iamyourfather@mail.com").save();
new Person("Luke", "iamyourson@mail.com", people[0]).save();
new Person("Palpatine", "iamyourmaster@mail.com").save();

app.listen(4000, () => console.log('Visit the dark side of the force in http://localhost:4000/force'));
