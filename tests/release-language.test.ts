import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import {initial} from '../src/storage.ts';
import {variants,catalog} from '../src/content/catalog.ts';
import {getSolutions} from '../src/content/answer-key.ts';
import {renderSubject} from '../src/ui/subject.ts';
import {renderHints,renderAnswerKey} from '../src/ui/education.ts';
import {renderProgress,renderExamLanding} from '../src/ui/overview.ts';
const require=createRequire(import.meta.url);
const {assertNoSlogans}=require('../scripts/verify-ui-language.cjs');
test('release language check rejects old slogans, accents, case and escaped bundle strings',()=>{
 for(const text of ['PEQUENOS PASSOS. Progresso real.','Seu pr\\u00f3ximo passo come\\u00e7a aqui.','Pratique sob pressão.<br>Ganhe confiança.','Sua JORNADA'])assert.throws(()=>assertNoSlogans(text),/Frase decorativa antiga/);
 assert.doesNotThrow(()=>assertNoSlogans('Retorne True se os pares estiverem na ordem correta.'));
});
test('all rendered exercises, hints, answers, overview and startup UI are free of the old slogans',()=>{
 for(const e of variants){assertNoSlogans(renderSubject(e),e.id);assertNoSlogans(renderHints(e,false),e.id);assertNoSlogans(renderAnswerKey(e,false),e.id);for(const s of getSolutions(e))assertNoSlogans(renderAnswerKey(e,true,0,s.id),e.id+'/'+s.id)}
 assertNoSlogans(renderProgress(initial(),catalog));assertNoSlogans(renderExamLanding(initial()));
 for(const file of ['src/main.ts','index.html','electron/main.cjs'])assertNoSlogans(fs.readFileSync(file,'utf8'),file);
});
