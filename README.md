# k-select-stream
This package implements on on-line k-min selection algorithm based on an underlying min-max heap. The heap code is a stripped-down version of that used in [priority-deque](https://www.npmjs.com/package/priority-deque). The package has a single non-default export `{ KSelect }`. `KSelect` instances implement the generator protocol, so new values can be pushed in and the latest k-min value extracted by calling the `next(value)` method. `KSelect` instances are infinite iterables which will repeatedly yield the most up-to-date k-minimum value even if no other values have been pushed since the last peek. Processing each set of *n* new elements from a data stream requires O(n log_2(k)) time. As *k* is a constant, this is effectively constant time per stream element.

API
====

* `new KSelect<T>(k: number, compare?: (a: T, b: T) => number)` Constructs a new `KSelect`. By default, numbers will be compared numerically, and all other objects will be compared by converting to strings and calling `String.localeCompare()`.
* `clone(): KSelect<T>` Creates a shallow copy of the `KSelect` which remembers the k-smallest elements seen so far by the parent instance in O(k) time.
* `clear()` Resets the selector's memory.
* `readonly length: number` Indicates how many total items are currently stored in the selectors memory.
* `kmin(): T | undefined` Retrieves the k-smallest element seen so far, or `undefined` if fewer than `k` elements have yet been seen (i.e., if `length` is less than `k`).
* `get(): T[]` Retrieves all of the k-smallest elements seen so far (i.e., the full set of up-to-k elements stored in the selector's memory).
* `sorted(): T[]` Retrieves all of the k-smallest elements seen so far in sorted order.
* `next(value?: T): T | undefined` Optionally processes a new stream value and returns an iterator result object with the k-smallest element seen so far. If fewer than `k` elements have been seen so far (i.e., `length` is less than `k`), `undefined` will be returned.
* `[Symbol.iterator](): IterableIterator<T | undefined>` Returns an infinite iterator over the k-smallest element seen so far. This is suitable for use with `for(... of ...)` loops, as long as there is an internal break condition and/or the selector's state is modified inside the loop, as the loop will otherwise run forever yielding the same value repeatedly. `KSelect` instances should *not* be used with the spread operator.

Array-Like Methods
----

* `push(...elements: T[])` Processes new stream elements to update the k-min selection.
* `contains(e: T): boolean` Determines whether or not the memory of k-smallest elements seen so far contains a specific element, via `===` comparison.
* `some(fn: (e: T) => boolean): boolean` Determines whether or not any of the k-smallest elements seen so far satisfies the given predicate.
* `every(fn: (e: T) => boolean): boolean` Determines whether or not all of the k-smallest elements seen so far satisfy the given predicate.
* `find(fn: (e: T) => boolean): T | undefined` Returns an element in the set of k-smallest elements seen so far which satisfies the given predicate, or `undefined` if there is no such element.
* `forEach(fn: (e: T) => void)` Executes the given callback function once for each of the k-smallest elements seen so far; no specific ordering is guaranteed.