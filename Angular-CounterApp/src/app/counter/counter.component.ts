import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  imports: [],
  templateUrl: './counter.component.html',
  styleUrl: './counter.component.css'
})
export class CounterComponent {
  // 1. On crée notre propriété 'number' avec un Signal
  number = signal(0);

  // 2. Fonction Increment
  increment() {
    this.number.update(val => val + 1);
  }

  // 3. Fonction Decrement
  decrement() {
    this.number.update(val => val - 1);
  }

  // 4. Fonction Reset
  reset() {
    this.number.set(0);
  }
}
