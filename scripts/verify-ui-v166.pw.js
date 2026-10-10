async (page)=>{
 await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>window.__COZY_QA__&&!document.querySelector('#loading'));
 await page.evaluate(()=>{const q=window.__COZY_QA__;q.ui.splash=false;q.ui.story=null;document.querySelector('#overlay-root').innerHTML='';q.navigate('merge');});
 const checks=[];const check=(name,passed)=>{checks.push({name,passed:!!passed});if(!passed)throw Error(name);};
 check('棋盘任务卡不显示素材等级，仍显示图和数量',await page.evaluate(()=>document.querySelectorAll('.order-summary').length>=1&&!document.querySelector('.order-summary .need-level')&&document.querySelectorAll('.order-summary .required-item .count').length>0));
 check('经验缩略图完整显示EXP',await page.evaluate(()=>Array.from(document.querySelectorAll('.reward-xp-icon')).every(el=>{const range=document.createRange();range.selectNodeContents(el);return el.textContent==='EXP'&&range.getBoundingClientRect().width<=el.getBoundingClientRect().width;})));
 await page.screenshot({path:'output/playwright/task-labels-v1.6.6.png'});
 await page.locator('.order-summary').first().click();await page.locator('.modal').evaluate(async el=>{await Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{})));});
 check('展开详情保留素材等级，奖励显示EXP',await page.evaluate(()=>document.querySelectorAll('.modal .need-level').length>0&&document.querySelector('.modal .xp-reward')?.textContent.startsWith('EXP +')));
 await page.screenshot({path:'output/playwright/task-details-v1.6.6.png'});
 await page.evaluate(report=>window.__V166_REPORT__=report,{checks,allPassed:checks.every(c=>c.passed),version:'1.6.6',buildId:'cac8c4e7bec2',viewport:{width:390,height:844},physicalMobileVerified:false});console.log(JSON.stringify(checks));
}