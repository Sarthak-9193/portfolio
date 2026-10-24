export function makeCardImage({ kicker, title, sub }) {
  const canvas = document.createElement("canvas"); canvas.width=1200; canvas.height=800;
  const ctx=canvas.getContext("2d"); const gradient=ctx.createLinearGradient(0,0,1200,800);
  gradient.addColorStop(0,"#19090d"); gradient.addColorStop(1,"#080607"); ctx.fillStyle=gradient;ctx.fillRect(0,0,1200,800);
  ctx.strokeStyle="rgba(239,35,60,.45)";ctx.lineWidth=2;for(let i=0;i<9;i++){ctx.beginPath();ctx.arc(990,125,70+i*38,0,Math.PI*2);ctx.stroke();}
  ctx.fillStyle="#ef233c";ctx.font="24px monospace";ctx.letterSpacing="5px";ctx.fillText(kicker.toUpperCase(),82,120);
  ctx.fillStyle="#f8f5f5";ctx.font="700 76px Manrope, Arial, sans-serif";let line="",y=360;for(const word of title.split(" ")){const test=line?line+" "+word:word;if(ctx.measureText(test).width>1000){ctx.fillText(line,82,y);line=word;y+=95;}else line=test;}ctx.fillText(line,82,y);
  ctx.fillStyle="#bdb5b8";ctx.font="24px monospace";ctx.fillText(sub.toUpperCase(),82,700);return canvas.toDataURL("image/png");
}
