

//
// Note that this is supposed to run from command line.
// Do not use anything besides pause, control.runInBackground, console.log
//

// pause(2000)
type uint8 number;
type int8 number;
type uint16 number;
type int16 number;
type Function any;
type Action any;

namespace control {
	function runInBackground(f: ()=>void): void {
		thread(f);
	}

	function dmesg(s: string): void {
	}
}

function pause(t: number) {
	sleep(t);
}

function msg(s: string): void {
    console.log(s)
    control.dmesg(s)
    //pause(50);
}

msg("start!")

function assert(cond: boolean, m?: string) {
    if (!cond) {
        msg("assertion failed: ")
        if (m) {
            msg(m)
	}

        throw m;
    }
}

//
// start tests
//

let glb1: number;
let s2: string;
let x: number;
let action: Action;
let tot: string;
let lazyAcc: number;
let sum: number;
let u8: uint8
let i8: int8
let u16: uint16
let i16: int16

let xyz = 12;


let hasFloat = true
if ((1 / 10) == 0) {
    hasFloat = false
}

class Testrec {
    str: string;
    num: number;
    _bool: boolean;
    str2: string;
}

function clean() {
    glb1 = 0
    s2 = ""
    x = 0
    action = null
    tot = ""
    lazyAcc = 0
    sum = 0
}
function testForOf() {
    let arr = [1, 7, 8]
    let sum = 0
    for (let e of arr) {
        msg("FO:" + e)
        sum += (e - 1)
    }
    assert(sum == 13, "fo1")
    msg("loop1 done")

    // make sure we incr reference count of the array during the loop execution
    for (let q of [3, 4, 12]) {
        sum += (q - 2)
    }
    assert(sum == 26, "fo2")

    // iteration over a string
    let s = "hello, world!"
    let s2 = ""
    for (let c of s) {
        s2 += c
    }
    assert(s == s2, "fo3")

    // mutation of array during iteration
    let fibs = [0, 1]
    for (let x of fibs) {
        if (fibs.length < 10) {
            fibs.push(fibs[fibs.length - 2] + fibs[fibs.length - 1])
        }
    }
    assert(fibs.length == 10, "fo4")

    // mutation of array during iteration
    let xs = [10, 9, 8]
    for (let x of xs) {
        //assert(xs.removeElement(x), "fo5")
    }

    // array concatenation
    let yss = [[1, 2, 3], [4, 5], [6, 7, 8], [9, 10]]
    let concat: number[] = []
    for (let ys of yss) {
        for (let y of ys) {
            concat.push(y)
        }
    }
    assert(concat.length == 10, "fo6")

    sum = 0
    for (let y of concat) {
        sum += y
    }
    assert(sum == 55, "fo7")


    let f = []
    glb1 = 0
    for (const q of [1, 12]) {
        f.push(() => {
            glb1 += q
        })
    }
    f[0]()
    f[1]()
    assert(glb1 == 13, "foc")

    msg("for of done")
}

testForOf()
clean()
msg("test OK!")
