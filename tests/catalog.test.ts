import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import type {Exercise} from '../src/types.ts';
const {variants,catalog}:{variants:Exercise[],catalog:Exercise[]}=JSON.parse(fs.readFileSync('.cache/catalog.json','utf8'));
test('14 complete exercises across six levels, with exact typed signatures and distinct variants',()=>{assert.equal(catalog.length,14);assert.deepEqual([1,2,3,4,5,6].map(n=>catalog.filter(e=>e.level===n).length),[2,2,4,3,2,1]);for(const e of variants){assert.match(e.signature,new RegExp(`^def ${e.name}\\(`));assert.ok(e.file.endsWith('.py'));assert.equal(e.hints.length,3);assert.ok(e.frames.length);assert.ok(e.examples.length);assert.ok(e.tests.length>=50);assert.ok(e.solution.startsWith('def '+e.name));assert.ok(e.source.startsWith('https://'))}});
test('all public examples are used unchanged in the selected version',()=>{for(const e of catalog)for(const example of e.examples)assert.ok(e.tests.some(t=>t.input===example.input&&t.output===example.output&&!t.hidden))});
test('sculptor and sorter variants preserve distinct outputs and rule sets',()=>{const standard=variants.find(e=>e.id==='string_sculptor')!,old=variants.find(e=>e.id==='string_sculptor_examshell')!;assert.notEqual(standard.examples.find(x=>x.input.includes('Hello World'))?.output,old.examples.find(x=>x.input.includes('Hello World'))?.output);assert.ok(variants.find(e=>e.id==='cryptic_sorter')!.restrictions.length);assert.equal(variants.find(e=>e.id==='cryptic_sorter_xornic')!.restrictions.length,0)});
