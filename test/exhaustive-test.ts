import 'mocha';
import { expect } from 'chai';
import { KSelect } from '../src';

const test_sets = [
  [9,4,13,17,17,15,1,15,14,17,17,3,2,16,12,4,14,9,16,8,1,3,9,3,19,2,15,15,18,1,20,15,10,18,10,18,14,11,6,3,20,17,8,6,6,5,5,1,8,20,9,11,18,7,12,11,3,17,16,14,4,14,8,10,7,4,5,1,4,16,4,11,5,6,7,20,13,14,3,12,10,6,10,14,3,17,17,3,3,5,7,3,4,1,3,19,14,6,4,6],
  [8,9,5,8,2,17,7,10,13,19,18,4,10,11,11,2,7,8,16,6,19,17,3,10,12,5,16,7,13,19,2,2,1,4,14,16,9,19,18,7,18,5,15,14,6,16,6,12,10,4,4,19,14,7,3,18,8,6,1,5,1,1,3,12,5,11,16,17,12,20,6,20,18,2,20,13,8,19,8,16,10,0,1,9,17,12,12,18,15,3,8,6,1,4,8,1,5,6,13,11],
  [12,6,13,0,20,19,11,11,1,11,17,5,14,0,11,7,11,3,6,2,6,11,3,11,4,19,18,15,4,10,15,11,10,6,18,11,4,10,1,7,15,6,10,20,20,2,2,14,20,10,9,18,14,15,7,6,11,9,4,17,13,13,18,11,1,19,7,18,19,7,5,14,14,10,13,5,8,7,17,20,1,9,2,15,7,14,10,1,17,4,0,16,9,15,18,1,5,16,17,17],
  [6,5,11,1,5,18,19,5,10,6,4,16,19,19,14,13,13,6,13,2,5,19,5,9,16,19,3,2,14,20,6,12,16,11,6,13,8,10,12,8,8,4,16,2,12,9,6,14,4,1,15,11,15,8,9,11,19,3,5,6,19,1,18,3,16,20,19,16,11,2,8,2,7,0,4,8,12,4,8,17,5,1,8,14,16,15,7,2,14,7,12,8,8,18,7,11,6,19,1,4],
  [12,12,13,10,14,10,12,13,19,13,12,14,10,6,18,17,13,12,15,2,17,20,9,5,6,17,5,1,19,3,10,7,3,4,11,19,3,10,11,7,18,18,6,10,6,19,9,14,16,3,13,14,19,9,17,16,20,16,18,18,1,14,18,4,3,8,15,3,3,4,15,20,19,3,9,19,4,20,18,15,8,12,13,13,20,16,8,6,19,0,11,19,17,0,2,12,10,5,1,2],
];

describe("KSelect Tests", () => {
  for (let t = 1; t <= 5; t++) {
    const items = test_sets[t-1]; //Array.from({ length: 100 }, () => Math.round(Math.random()*20));
    const sorted = items.sort((a,b) => a-b);
    for (let k = 10; k <= 100; k += 10) {
      const s = sorted.slice(0, k);
      it(`(${t}) Should get ${k}-min elements with bulk pushed unsorted elements.`, () => {
        const ks = new KSelect<number>(k);
        ks.push(...items);
        expect(ks.length).to.eql(k);
        expect(ks.kmin()).to.eql(sorted[k-1]);
        expect(ks.min()).to.eql(sorted[0]);
        expect(ks.sorted()).to.eql(s);
      });

      it(`(${t}) Should get ${k}-min elements with bulk pushed sorted elements.`, () => {
        const ks = new KSelect<number>(k);
        ks.push(...sorted);
        expect(ks.length).to.eql(k);
        expect(ks.kmin()).to.eql(sorted[k-1]);
        expect(ks.min()).to.eql(sorted[0]);
        expect(ks.sorted()).to.eql(s);
      });

      it(`(${t}) Should get ${k}-min elements with incrementally pushed unsorted elements.`, () => {
        const ks = new KSelect<number>(k);
        for (let i = 0; i < 100; i++) { ks.push(items[i]); }
        expect(ks.length).to.eql(k);
        expect(ks.kmin()).to.eql(sorted[k-1]);
        expect(ks.min()).to.eql(sorted[0]);
        expect(ks.sorted()).to.eql(s);
      });

      it(`(${t}) Should get ${k}-min elements with incrementally pushed sorted elements.`, () => {
        const ks = new KSelect<number>(k);
        for (let i = 0; i < 100; i++) { ks.push(items[i]); }
        expect(ks.length).to.eql(k);
        expect(ks.kmin()).to.eql(sorted[k-1]);
        expect(ks.min()).to.eql(sorted[0]);
        expect(ks.sorted()).to.eql(s);
      });
    }
  }
});