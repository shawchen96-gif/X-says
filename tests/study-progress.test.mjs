import assert from "node:assert/strict";
import test from "node:test";
import {prepareStudy} from "../app/study-progress.mjs";
const keys = Array.from({length: 60}, (_, i) => `word${i}`);
test("random order contains every word once", () => {
 const p = prepareStudy(keys, undefined, null, false, () => 0);
 assert.notDeepEqual(p.progress.order, keys);
 assert.deepEqual([...p.progress.order].sort(), [...keys].sort());
});
test("next batch and next day continue without repeats", () => {
 const saved = {order: [...keys].reverse(), cursor: 20};
 const p = prepareStudy(keys, saved, null, false);
 assert.equal(p.start, 20);
 assert.deepEqual(p.progress.order, saved.order);
 assert.equal(new Set([...saved.order.slice(0,20), ...p.progress.order.slice(p.start,p.start+20)]).size,40);
 assert.equal(prepareStudy(keys, {...saved,cursor:27},{start:20,index:7},false).start,27);
});
test("refresh resumes and different books keep their own cursor", () => {
 const p=prepareStudy(keys,{order:keys,cursor:7},{start:0,index:7},true);
 assert.equal(p.resume,true); assert.equal(p.start+7,7);
 assert.equal(prepareStudy(keys,{order:keys,cursor:35},null,false).start,35);
});
test("legacy and stale sessions use the saved next word", () => {
 assert.equal(prepareStudy(keys,{order:keys,cursor:7},{index:7},true).start,7);
 assert.equal(prepareStudy(keys,{order:keys,cursor:7},{start:0,index:6},true).resume,false);
 assert.equal(prepareStudy(keys,{order:['removed'],cursor:7},null,false).start,0);
 assert.equal(prepareStudy(keys,{order:keys,cursor:-1},null,false).start,0);
});
