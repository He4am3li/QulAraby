/**
 * Law 10 shoot-out evaluator. Alternating kicks, early mathematical clinch,
 * then one-for-one sudden death after five kicks each.
 * @param {boolean[]} home
 * @param {boolean[]} away
 * @returns {'home'|'away'|null}
 */
export function shootoutResult(home, away) {
  const homeGoals=home.filter(Boolean).length;
  const awayGoals=away.filter(Boolean).length;
  const remainingHome=Math.max(0,5-home.length);
  const remainingAway=Math.max(0,5-away.length);
  if(home.length<=5 && away.length<=5){
    if(homeGoals>awayGoals+remainingAway) return 'home';
    if(awayGoals>homeGoals+remainingHome) return 'away';
    if(home.length===5 && away.length===5){
      return homeGoals===awayGoals?null:homeGoals>awayGoals?'home':'away';
    }
    return null;
  }
  if(home.length===away.length && home.length>5){
    return homeGoals===awayGoals?null:homeGoals>awayGoals?'home':'away';
  }
  return null;
}
