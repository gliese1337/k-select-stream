enum CMP {
    LT = -1,
    EQ = 0,
    GT = 1,
}

const defaultComp = <T>(a: T, b: T) => {
    if(typeof a === 'number') return Math.sign(a - (+b));
    return (""+a).localeCompare(""+b);
}

function isMinLevel(i: number): boolean {
    return (Math.log2(i + 1) & 1) === 0;
}

const empty = Symbol() as unknown;

export class KSelect<T> {

    private heap: T[] = [];

    private size = 0;

    private limit: number;

    private compare: (a: T, b: T) => CMP = defaultComp;

    public constructor(k: number, compare?: (a: T, b: T) => number) {
        if (typeof compare === 'function') {
            this.compare = (a, b) => Math.sign(compare(a, b));
        }

        this.limit = k;
     }

    public clone(): KSelect<T> {
        const pd = new KSelect<T>(this.limit);
        pd.compare = this.compare;
        pd.heap = [...this.heap];
        pd.size = this.size;

        return pd;
    }

    public kmin() : T | undefined {
        return this.size === this.limit ? this.heap[this.maxIndex()] : undefined;
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
        this.size = 0;
    }

    private trickleDown(i: number) {
        const { heap, compare } = this;
        const [LT, GT] = isMinLevel(i) ? [CMP.LT, CMP.GT] : [CMP.GT, CMP.LT];

        while (true) {
            const { has, m, isgc } = this.getSmallestDescendent(i, GT);
            if (!has) break;

            const hm = heap[m];
            const hi = heap[i];
            if (compare(hm, hi) === LT) {
                heap[i] = hm;
                heap[m] = hi;

                if(isgc) {
                    const p = (m - 1) >> 1;
                    const hp = heap[p];
                    if (compare(hi, hp) === GT) {
                        heap[p] = hi;
                        heap[m] = hp;
                    }
                    i = m;
                    continue;
                }
            }

            break;
        }
    }

    private getSmallestDescendent(i: number, GT: CMP) {
        const { heap, size, compare } = this;
        
        const l = (i << 1) + 1;
        if (l >= size) return { has: false, isgc: false, m: l };

        const r = l + 1;
        if (r >= size) return { has: true, isgc: false, m: l };
        
        const { has: hasl, m: lc } = this.getSmallestChild(l, GT);
        if (!hasl) {
            return {
                has: true,
                isgc: false,
                m: compare(heap[l], heap[r]) === GT ? r : l,
            };     
        }

        const { has: hasr, m: rc } = this.getSmallestChild(r, GT);
        if (!hasr) return { has: true, isgc: true, m: lc };

        return {
            has: true,
            isgc: true,
            m: compare(heap[lc], heap[rc]) === GT ? rc : lc,
        };    

    }

    private getSmallestChild(i: number, GT: CMP) {
        const { size, heap, compare } = this;
        
        const l = (i << 1) + 1;
        if (l >= size) return { has: false, m: l };

        const r = l + 1;
        if (r >= size) return { has: true, m: l };

        return {
            has: true, 
            m: compare(heap[l], heap[r]) === GT ? r : l,
        }; 
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
            if (cmp === CMP.GT) {
                heap[i] = hp;
                heap[p] = hi;
                i = p;
                LT = CMP.GT;
                moved = true;
            }
        } else if (cmp === CMP.LT) {
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
            if (compare(hi, hp) === LT) {
                heap[i] = hp;
                heap[gp] = hi;
                i = gp;
                moved = true;
            } else break;
        }

        return moved;
    }

    /** Array-Like Methods **/

    public get length() {
        return this.size;
    }

    private maxIndex() {
        if (this.size < 2) return 0;
        if (this.size === 2) return 1;

        const { heap } = this;
        
        return this.compare(heap[1], heap[2]) === CMP.LT ? 2 : 1;
    }

    public push(...elements: T[]) {
        if (this.limit === 0) return;
        if (elements.length === 0) return;

        const { heap, compare } = this;

        const l = elements.length;
        const addable = Math.min(this.limit - this.size, l);

        let i = 0;
        if (this.size === 0) {
            heap[0] = elements[0];
            this.size = 1;
            i = 1;
        }

        for (; i < addable; i++) {
            const e = elements[i];
            const index = this.size++;
            this.heap[index] = e;
            this.bubbleUp(index);
        }

        if (this.limit === 1) {
            for (; i < l; i++) {
                const e = elements[i];
                if (compare(e, heap[0]) === CMP.LT) {
                    heap[0] = e;
                }
            }
        } else {
            let maxI = this.maxIndex();
            let maxE = heap[maxI];
            for (; i < l; i++) {
                const e = elements[i];
                if (compare(e, maxE) !== CMP.LT) {
                    continue;
                }

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
