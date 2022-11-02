enum CMP {
  LT = -1,
  EQ = 0,
  GT = 1,
}

const defaultComp = <T>(a: T, b: T) => {
  return (typeof a === 'number') ?
    (a - (+b)) || 0 :
    (""+a).localeCompare(""+b);
};

function isMinLevel(i: number): boolean {
  return (Math.log2(i + 1) & 1) === 0;
}

function extremalDescendant<T>(h: T[], compare: (a: T, b: T) => CMP, i: number, C: CMP.LT | CMP.GT) {
  const len = h.length;
  // get the index of the smallest child or grandchild of i
  // 2i+1, 2i+2, 4i+3, 4i+4, 4i+5, 4i+6
  const lc = (i<<1)+1; // 2i+1, left child
  if (lc >= len) { return -1; } // no children

  // set m to the index of the smallest child or grandchild
  const rc = lc + 1;
  if (rc >= len) { return lc; } // if there's only one child, that's the minimum

  // set m to the minimum child
  let m = Math.sign(compare(h[rc], h[lc])) === C ? rc : lc;
  // check the four grandchildren
  let gc = (i<<2)+3;
  const end = Math.min(gc + 4, len);
  for (; gc < end; gc++) {
    if (Math.sign(compare(h[gc], h[m])) === C) {
      m = gc;
    }
  }
  return m;
}

const empty = Symbol() as unknown;

export class KSelect<T> {

  private heap: T[] = [];
  private limit: number;

  private compare: (a: T, b: T) => CMP = defaultComp;

  public constructor(k: number, compare?: (a: T, b: T) => number) {
      if (typeof compare === 'function') {
          this.compare = compare;
      }

      this.limit = k;
    }

  public clone(): KSelect<T> {
      const ks = new KSelect<T>(this.limit);
      ks.compare = this.compare;
      ks.heap = [...this.heap];
      return ks;
  }

  public kmin() : T | undefined {
    return this.heap.length === this.limit ? this.heap[this.maxIndex()] : undefined;
  }

  public min() : T | undefined {
    return this.heap[0];
  }

  public get() {
    return this.heap.slice();
  }

  public sorted() {
    return this.heap.slice().sort(this.compare);
  }

  public next(e: T = empty as T): IteratorResult<T | undefined> {
    if(e !== empty) this.push(e);
    return { value: this.kmin(), done: false };
  } 

  public [Symbol.iterator](): IterableIterator<T | undefined> {
    return this;
  }

  /** Heap Maintenance Methods **/

  public clear() {
    this.heap.length = 0;
  }

  private trickleDown(i: number) {
    const { heap: h, compare } = this;
    let C: CMP.LT | CMP.GT = isMinLevel(i) ? CMP.LT : CMP.GT;
    for (;;) {
      // get the index of the smallest child or grandchild of i
      const m = extremalDescendant(h, compare, i, C);
      if (m === -1) { return; } // while there are children
      const hi = h[i];
      const hm = h[m];
      if (Math.sign(compare(hm, hi)) === C) { // if h[i] < h[m]
        // swap h[m] and h[i]
        h[i] = hm;
        h[m] = hi;
        if (m > ((i+1)<<1)) { // if m is a grandchild of i
          const parent = (m-1)>>1;
          const hp = h[parent];
          if (Math.sign(compare(hp, hi)) === C) {
            // swap h[m] and h[parent(m)]
            h[m] = hp;
            h[parent] = hi;
          }
        } else {
          // if we only moved down one level, swap max vs. min
          C = -C;
        }
        i = m;
      } else {
        break;
      }
    }
  }

  private bubbleUp(i: number): boolean { // i is always > 0
    const { heap, compare } = this;
    const p = (i - 1) >> 1;
    const hi = heap[i];
    const hp = heap[p];
    const cmp = compare(hi, hp);
    let moved = false;

    let LT = CMP.LT;
    if (isMinLevel(i)) {
      if (cmp > 0) {
        heap[i] = hp;
        heap[p] = hi;
        i = p;
        LT = CMP.GT;
        moved = true;
      }
    } else if (cmp < 0) {
      heap[i] = hp;
      heap[p] = hi;
      i = p;
      moved = true;
    } else {
      LT = CMP.GT;
    }
    
    while (i >= 3) {
      const gp = (((i - 1) >> 1) - 1) >> 1;
      const hi = heap[i];
      const hp = heap[gp];
      if (Math.sign(compare(hi, hp)) === LT) {
        heap[i] = hp;
        heap[gp] = hi;
        i = gp;
        moved = true;
      } else {
        break;
      }
    }

    return moved;
  }

  /** Array-Like Methods **/

  public get length() {
      return this.heap.length;
  }

  private maxIndex() {
    const { heap } = this;
    if (heap.length < 2) { return 0; }
    if (heap.length === 2) { return 1; }

    return this.compare(heap[1], heap[2]) < 0 ? 2 : 1;
  }

  public push(...elements: T[]) {
    if (this.limit === 0) { return; }
    if (elements.length === 0) { return; }

    const { heap, compare, limit } = this;
    let size = heap.length;

    const l = elements.length;
    const addable = Math.min(limit - size, l);

    let i = 0;
    if (size === 0) {
      heap[0] = elements[0];
      size = 1;
      i = 1;
    }

    for (; i < addable; i++, size++) {
      this.heap[size] = elements[i];
      this.bubbleUp(size);
    }

    if (limit === 1) {
      for (; i < l; i++) {
        const e = elements[i];
        if (compare(e, heap[0]) < 0) {
          heap[0] = e;
        }
      }
    } else {
      let maxI = this.maxIndex();
      let maxE = heap[maxI];
      for (; i < l; i++) {
        const e = elements[i];
        if (compare(e, maxE) >= 0) { continue; }

        heap[maxI] = e;
        if (!this.bubbleUp(maxI)) {
          this.trickleDown(maxI);
        }

        maxI = this.maxIndex();
        maxE = heap[maxI];
      }
    }
  }
    
  public contains(e: T): boolean {
    return this.heap.indexOf(e) > -1;
  }

  public some(fn: (e: T) => boolean): boolean {
    return this.heap.some(fn);
  }

  public every(fn: (e: T) => boolean): boolean {
    return this.heap.every(fn);
  }

  public find(fn: (e: T) => boolean): T | undefined {
    return this.heap.find(fn);
  }

  public forEach(fn: (e: T) => void) {
    this.heap.forEach(fn);
  }
}
