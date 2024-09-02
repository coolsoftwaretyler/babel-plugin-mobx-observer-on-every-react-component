import './App.css'
import { makeAutoObservable } from "mobx";

class CounterStore {
  count = 0;

  constructor() {
    makeAutoObservable(this);
  }

  increment() {
    this.count++;
  }

  decrement() {
    this.count--;
  }
}

const counterStore = new CounterStore();

const App = function App() {
  return (
    <>
      <div>
        <h1>Count: {counterStore.count}</h1>
        <button onClick={() => counterStore.increment()}>Increment</button>
        <button onClick={() => counterStore.decrement()}>Decrement</button>
      </div>
    </>
  )
}

export default App;
