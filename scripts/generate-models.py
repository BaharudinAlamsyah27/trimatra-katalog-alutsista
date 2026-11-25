"""Generate the catalog's original, lightweight CC0 glTF models.

All dimensions are normalized for viewer presentation. Local axes: +Y up, +Z forward.
Run with: python scripts/generate-models.py
"""
import json, math, os, struct
from collections import defaultdict

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'models')
os.makedirs(OUT, exist_ok=True)

MATS = {
 'olive':([.22,.27,.16,1],.82,.0), 'green':([.30,.36,.20,1],.78,.0),
 'tan':([.48,.43,.31,1],.84,.0), 'dark':([.075,.09,.085,1],.7,.0),
 'rubber':([.025,.03,.028,1],.95,.0), 'metal':([.16,.18,.18,1],.34,.72),
 'steel':([.31,.34,.34,1],.3,.7), 'glass':([.018,.045,.06,1],.12,.35),
 'navy':([.30,.34,.36,1],.68,.0), 'deck':([.19,.22,.23,1],.8,.0),
 'air':([.43,.49,.53,1],.62,.05),
 'white':([.72,.74,.71,1],.72,.0), 'mark':([.65,.14,.10,1],.65,.0),
 'exhaust':([.045,.055,.055,1],.45,.45), 'wood':([.24,.19,.12,1],.72,.0),
}

class Model:
 def __init__(self,slug):
  self.slug=slug; self.tris=defaultdict(list)
 def tri(self,a,b,c,mat):
  self.tris[mat].append((a,b,c))
 def quad(self,a,b,c,d,mat): self.tri(a,b,c,mat); self.tri(a,c,d,mat)
 def box(self,c,d,mat):
  x,y,z=c; a,b,h=[v/2 for v in d]
  p=[(x-a,y-b,z-h),(x+a,y-b,z-h),(x+a,y+b,z-h),(x-a,y+b,z-h),(x-a,y-b,z+h),(x+a,y-b,z+h),(x+a,y+b,z+h),(x-a,y+b,z+h)]
  for f in [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]: self.quad(*(p[i] for i in f),mat)
 def ellipsoid(self,c,r,mat,seg=16,rings=9):
  cx,cy,cz=c; rx,ry,rz=r
  for j in range(rings):
   v0=-math.pi/2+math.pi*j/rings; v1=-math.pi/2+math.pi*(j+1)/rings
   for i in range(seg):
    a=2*math.pi*i/seg; b=2*math.pi*(i+1)/seg
    def pt(v,t): return (cx+rx*math.cos(v)*math.cos(t),cy+ry*math.sin(v),cz+rz*math.cos(v)*math.sin(t))
    self.quad(pt(v0,a),pt(v0,b),pt(v1,b),pt(v1,a),mat)
 def cyl(self,p1,p2,r,mat,seg=12,r2=None):
  if r2 is None:r2=r
  ax=[p2[i]-p1[i] for i in range(3)]; L=math.sqrt(sum(t*t for t in ax))
  if L<1e-7:return
  u=[t/L for t in ax]; ref=[0,1,0] if abs(u[1])<.9 else [1,0,0]
  v=[u[1]*ref[2]-u[2]*ref[1],u[2]*ref[0]-u[0]*ref[2],u[0]*ref[1]-u[1]*ref[0]]; vl=math.sqrt(sum(t*t for t in v)); v=[t/vl for t in v]
  w=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
  for i in range(seg):
   a=2*math.pi*i/seg;b=2*math.pi*(i+1)/seg
   q=lambda p,r,t:tuple(p[k]+r*(v[k]*math.cos(t)+w[k]*math.sin(t)) for k in range(3))
   self.quad(q(p1,r,a),q(p1,r,b),q(p2,r2,b),q(p2,r2,a),mat)
   self.tri(p1,q(p1,r,b),q(p1,r,a),mat); self.tri(p2,q(p2,r,a),q(p2,r,b),mat)
 def loft(self,sections,mat,n=12):
  # section tuples: (z, halfwidth, bottomY, topY)
  rings=[]
  for z,w,lo,hi in sections:
   ring=[]
   for i in range(n):
    a=2*math.pi*i/n; ring.append((math.sin(a)*w, (lo+hi)/2+math.cos(a)*(hi-lo)/2,z))
   rings.append(ring)
  for j in range(len(rings)-1):
   for i in range(n):self.quad(rings[j][i],rings[j][(i+1)%n],rings[j+1][(i+1)%n],rings[j+1][i],mat)
  self.tri((0,(sections[0][2]+sections[0][3])/2,sections[0][0]),rings[0][1],rings[0][0],mat)
  self.tri((0,(sections[-1][2]+sections[-1][3])/2,sections[-1][0]),rings[-1][-1],rings[-1][0],mat)
 def plate(self,pts,thick,mat):
  # polygon extruded along Y
  low=[(x,y-thick/2,z) for x,y,z in pts]; high=[(x,y+thick/2,z) for x,y,z in pts]
  for i in range(1,len(pts)-1):self.tri(low[0],low[i],low[i+1],mat);self.tri(high[0],high[i+1],high[i],mat)
  for i in range(len(pts)):self.quad(low[i],low[(i+1)%len(pts)],high[(i+1)%len(pts)],high[i],mat)
 def wheel(self,x,y,z,r=.20,width=.15):
  self.cyl((x-width/2,y,z),(x+width/2,y,z),r,'rubber',16)
  self.cyl((x-width*.53,y,z),(x-width*.53-.012,y,z),r*.46,'metal',12)
  self.cyl((x+width*.53,y,z),(x+width*.53+.012,y,z),r*.46,'metal',12)
 def track(self,x,z0,z1,y=.34):
  # two continuous track runs with articulated pads, return rollers and road wheels
  w=.22; top=y+.30; bot=y-.25; r=.27
  for xx in (x-w/2,x+w/2):
   self.cyl((xx,top,z0),(xx,top,z1),r*.82,'dark',14); self.cyl((xx,bot,z0),(xx,bot,z1),r,'dark',14)
   # track side panels along upper/lower runs and curved end sprockets
   self.box((xx,y,(z0+z1)/2),(0.055,.13,z1-z0),'dark')
  for i in range(18):
   z=z0+(z1-z0)*i/17
   for yy in (top+r*.88,bot-r*.9):
    self.box((x,yy,z),(w+.07,.055,.075),'steel' if i%3==0 else 'dark')
  count=6
  for i in range(count):
   z=z0+.12+(z1-z0-.24)*i/(count-1)
   self.wheel(x,y,z,.205,.18)
  self.wheel(x,y,z0,.19,.18);self.wheel(x,y,z1,.22,.18)
 def turret(self,x,y,z,size=(.95,.42,.85),mat='olive'):
  a,b,c=size
  # faceted armored bustle and roof, command cupola, sights and gun
  self.box((x,y,z),(a*.82,b,c*.72),mat); self.box((x,y-b*.10,z-c*.43),(a,b*.76,c*.28),mat)
  self.ellipsoid((x,y+b*.53,z-.08),(a*.22,.075,a*.22),'green',12,6)
  self.cyl((x,y+b*.48,z-.08),(x,y+b*.73,z-.08),a*.115,'olive',12)
  for dx in (-.27,.27):self.ellipsoid((x+dx,y+b*.62,z-.08),(.045,.027,.045),'glass',10,6)
  self.cyl((x,y-.04,z+c*.34),(x,y-.02,z+c*.65),.11,'metal',12)
  self.cyl((x,y-.02,z+c*.64),(x,y-.02,z+c*1.22),.052,'dark',12)
  self.cyl((x,y-.02,z+c*1.22),(x,y-.02,z+c*1.28),.07,'metal',12)
  for side in (-1,1):
   self.box((x+side*a*.52,y+.02,z-.05),(.18,.22,.48),'olive')
   for k in range(3): self.cyl((x+side*a*.62,y+.12,z-.16+k*.12),(x+side*a*.62,y+.12,z-.12+k*.12),.035,'dark',8)
 def tank(self,light=False,badak=False):
  deck='green' if self.slug.startswith('pindad') else 'olive'
  self.track(-.72,.85,-.88); self.track(.72,.85,-.88)
  self.box((0,.82,0),(1.35,.38,2.45),deck)
  # sloped glacis and rear armor panels
  self.plate([(-.72,.9,.76),(.72,.9,.76),(.60,1.17,1.24),(-.60,1.17,1.24)],.14,deck)
  self.plate([(-.68,.74,-1.17),(.68,.74,-1.17),(.74,.98,-.91),(-.74,.98,-.91)],.12,deck)
  if badak:
   for z in (-.58,-.22,.18):
    self.wheel(-.93,.55,z,.40,.18);self.wheel(.93,.55,z,.40,.18)
   self.box((0,1.22,-.12),(1.1,.3,.72),'olive');self.turret(0,1.48,-.08,(.83,.43,.8),'green')
   self.cyl((0,1.46,.25),(0,1.48,1.05),.095,'metal');self.cyl((0,1.48,1.05),(0,1.48,1.50),.055,'dark')
   self.cyl((0,1.48,1.50),(0,1.48,1.58),.075,'metal')
  else:
   for sx in (-1,1):
    for i in range(3):self.box((sx*.7,.92,.55-i*.32),(.13,.25,.22),'green')
   if self.slug=='harimau-medium-tank':self.turret(0,1.34,-.05,(1.08,.48,.84),'tan')
   else:self.turret(0,1.39,-.04,(1.30,.57,1.0),'olive')
  # fenders, lights, antennae, towing hooks, smoke launchers and detail hatches
  for sx in (-1,1):
   self.box((sx*.83,.88,-.02),(.12,.09,2.3),'metal')
   for z in (-1.0,.95):self.ellipsoid((sx*.78,.94,z),(.09,.08,.10),'white',10,6)
   self.cyl((sx*.45,1.04,-.68),(sx*.45,1.55,-1.0),.014,'dark',8)
   for z in (-.35,-.21,-.07,.07):self.cyl((sx*.38,1.48,-.40),(sx*.54,1.58,z),.035,'metal',8)
  for z in (-.62,.38):self.cyl((-.26,.74,z),(.26,.74,z),.055,'metal',8)
 def wheeled_vehicle(self,n=6,open_top=False,gun=False):
  c='green'; zpos=[-.88+i*1.76/(n-1) for i in range(n)]
  # angular hull with sloped nose and rear, faceted roofline
  self.loft([(-1.28,.48,.42,1.18),(-1.05,.72,.35,1.52),(.55,.76,.35,1.58),(1.02,.61,.42,1.42),(1.23,.48,.55,1.22)],c,8)
  for sx in (-1,1):
   self.box((sx*.66,.78,-.04),(.11,.11,2.1),'metal')
   for z in zpos:self.wheel(sx*.81,.44,z,.34 if n==6 else .38,.23)
  # armored windshield, raised brow, side vision ports and doors
  if open_top:
   self.box((0,1.05,.38),(1.05,.15,.72),'olive')
   for sx in (-1,1):
    self.cyl((sx*.48,1.08,.72),(sx*.48,1.87,.42),.055,'metal',10)
    self.cyl((sx*.48,1.87,.42),(sx*.48,1.87,-.35),.055,'metal',10)
    self.cyl((sx*.48,1.87,-.35),(sx*.48,1.08,-.57),.055,'metal',10)
   self.box((0,1.9,.02),(1.0,.07,.07),'metal')
   self.box((0,1.22,-.12),(.65,.08,.5),'dark')
  else:
   self.box((-.28,1.26,.73),(.40,.36,.05),'glass');self.box((.28,1.26,.73),(.40,.36,.05),'glass')
   for sx in (-1,1):
    self.box((sx*.73,1.16,.12),(.025,.19,.32),'glass')
    for z in (-.20,-.65):self.box((sx*.765,.73,z),(.025,.40,.36),'green')
   self.box((0,1.48,.73),(1.03,.09,.13),'olive')
  if gun:
   self.turret(0,1.63,-.30,(.84,.43,.70),'olive')
  elif not open_top:
   self.ellipsoid((0,1.53,-.22),(.26,.15,.28),'olive',12,7)
   self.cyl((0,1.55,-.2),(0,2.0,-.35),.028,'metal',8)
  for sx in (-1,1):
   self.ellipsoid((sx*.54,1.14,.79),(.11,.07,.08),'white',10,6)
   self.box((sx*.68,1.03,-.94),(.12,.22,.23),'metal')
  self.box((0,.48,-1.33),(.50,.12,.10),'metal')
 def rifle(self):
  # rifle aligned forward +Z; slim detailed receiver/handguard and curved 30-round magazine
  self.box((0,0,0),(.23,.23,.66),'dark');self.box((0,.025,.24),(.26,.22,.38),'metal')
  self.box((0,.01,.68),(.18,.18,.47),'olive')
  self.cyl((0,.02,.82),(0,.02,1.45),.036,'metal',12)
  self.cyl((0,.02,1.44),(0,.02,1.52),.052,'dark',10)
  for z in (.48,.60,.72,.84):self.box((0,.14,z),(.21,.04,.035),'metal')
  self.box((0,.18,.28),(.38,.08,.08),'dark');self.box((0,.24,.28),(.08,.08,.08),'metal')
  self.box((0,-.17,-.01),(.14,.26,.22),'wood')
  self.plate([(-.09,-.21,-.14),(.09,-.21,-.14),(.10,-.42,.01),(.075,-.52,.20),(-.075,-.52,.20),(-.10,-.42,.01)],.10,'dark')
  self.plate([(-.12,-.02,-.43),(.12,-.02,-.43),(.15,-.09,-.80),(.11,-.19,-.92),(-.11,-.19,-.92),(-.15,-.09,-.80)],.13,'dark')
  self.box((0,.22,-.22),(.13,.07,.44),'metal');self.box((0,.30,-.22),(.06,.08,.08),'dark')
  for sx in (-1,1):
   self.box((sx*.15,.01,.61),(.04,.08,.39),'dark')
   self.cyl((sx*.18,-.03,.58),(sx*.18,-.03,.93),.012,'metal',6)
 def ship(self,kind):
  # long waterline hull: forward bow at +Z and tapered stern at -Z
  ship_configs={'makassar':(2.75,.72,1.95),'martadinata':(2.10,.47,1.55),'bung':(1.92,.43,1.35),'diponegoro':(1.75,.40,1.28),'sampari':(1.55,.34,1.1)}
  L,W,H=ship_configs[kind]
  self.loft([(-L/2,W*.62,.2,.48),(-L*.40,W,.12,.72),(L*.28,W,.12,.72),(L*.47,W*.69,.17,.65),(L/2,W*.05,.25,.34)],'navy',12)
  self.box((0,.68,0),(W*1.65,.14,L*.72),'deck')
  self.box((0,.82,-L*.19),(W*1.3,.22,L*.32),'white')
  # stealth sloped bridge and rows of dark windows
  self.plate([(-W*.48,.90,-L*.14),(W*.48,.90,-L*.14),(W*.34,1.45,-L*.02),(-W*.34,1.45,-L*.02)],.10,'navy')
  self.box((0,1.43,-L*.04),(W*.68,.12,L*.16),'navy')
  for sx in (-1,1):
   for z in (-L*.11,-L*.05,.01):self.box((sx*W*.27,1.23,z),(.018,.10,.035),'glass')
  self.box((0,1.58,-L*.035),(W*.40,.10,.16),'navy')
  self.cyl((0,1.60,-L*.03),(0,2.22,-L*.08),.035,'metal',10)
  self.cyl((-.30,1.95,-L*.08),(.30,1.95,-L*.08),.025,'metal',10)
  self.ellipsoid((0,2.19,-L*.08),(.24,.14,.16),'dark',12,6)
  for sx in (-1,1):
   self.cyl((sx*.18,2.13,-L*.08),(sx*.18,2.27,-L*.08),.014,'metal',8)
   for z in (-L*.2,-L*.3):self.box((sx*W*.52,.80,z),(.04,.24,.17),'navy')
  # forward naval gun with rotating mount, barrel, optical and sensor details
  self.cyl((0,.77,L*.28),(0,.91,L*.28),.20,'metal',14)
  self.box((0,1.0,L*.29),(W*.45,.28,.39),'navy')
  self.cyl((0,1.04,L*.46),(0,1.08,L*.70),.055,'metal',12)
  self.cyl((0,1.08,L*.70),(0,1.08,L*.83),.032,'dark',10)
  self.cyl((0,1.08,L*.83),(0,1.08,L*.87),.045,'metal',10)
  if kind=='martadinata':
   self.box((0,1.06,-L*.28),(W*1.28,.35,.48),'navy');self.box((0,1.02,-L*.39),(W*1.45,.12,.35),'deck')
   self.box((0,.93,-L*.48),(W*1.78,.08,.48),'deck')
  elif kind in ('bung','diponegoro'):
   self.box((0,1.0,-L*.27),(W*1.16,.30,.42),'white');self.box((0,.9,-L*.39),(W*1.62,.08,.42),'deck')
   self.cyl((0,1.55,-L*.21),(0,1.87,-L*.21),.13,'dark',12)
  elif kind=='makassar':
   self.box((0,1.09,-L*.25),(W*1.28,.88,L*.38),'white');self.box((0,1.61,-L*.05),(W*1.2,.16,L*.28),'white')
   self.box((0,.87,-L*.43),(W*1.8,.09,L*.40),'deck')
   for z in (-L*.36,-L*.27,-L*.18):self.box((0,.94,z),(W*1.55,.02,.018),'white')
   self.ellipsoid((.30,1.2,-L*.44),(.14,.10,.13),'green',12,6)
  else:
   for sx in (-1,1):
    for z in (-L*.10,-L*.18): self.box((sx*.16,1.13,z),(.12,.20,.42),'green')
  # railings, lifeboats, bollards and deck markings
  for sx in (-1,1):
   for i in range(11):
    z=-L*.40+i*L*.075
    self.cyl((sx*W*.82,.78,z),(sx*W*.82,.91,z),.012,'steel',6)
   for z in (-L*.27,L*.12):self.ellipsoid((sx*W*.72,.89,z),(.06,.08,.15),'mark',10,6)
  if kind in ('martadinata','bung','diponegoro','makassar'):
   self.box((0,.78,-L*.42),(W*.82,.03,L*.29),'white')
   self.cyl((0,.78,-L*.48),(0,1.02,-L*.48),.02,'white',8)
 def sub(self):
  L=3.1 if 'nagapasa' in self.slug else 2.8
  self.cyl((0,.78,-L*.46),(0,.78,L*.43),.40,'dark',24)
  self.ellipsoid((0,.78,L*.43),(.39,.39,.44),'dark',20,12);self.ellipsoid((0,.78,-L*.46),(.39,.39,.36),'dark',20,12)
  self.box((0,.78,0),(.36,.07,L*.69),'dark')
  # sail fairwater, upper bridge, raised periscopes and antennae
  self.plate([(-.33,.88,-.20),(.33,.88,-.20),(.25,1.38,-.03),(-.22,1.38,-.03)],.12,'dark')
  self.box((0,1.36,-.09),(.44,.08,.20),'dark')
  for x,h in [(-.16,.52),(-.06,.68),(.05,.60),(.16,.48)]:
   self.cyl((x,1.37,-.08),(x,1.37+h,-.08),.022,'steel',8)
  # cruciform hydroplanes, stern rudder and seven-blade screw
  for z in (-L*.40,L*.30):
   self.plate([(-.70,.78,z),(-.30,.85,z+.11),(.30,.85,z+.11),(.70,.78,z),(.30,.72,z-.11),(-.30,.72,z-.11)],.06,'dark')
  self.plate([(-.04,.25,-L*.46),(.04,.25,-L*.46),(.04,1.17,-L*.46),(-.04,1.17,-L*.46)],.05,'dark')
  self.cyl((0,.78,-L*.68),(0,.78,-L*.52),.075,'metal',12)
  for i in range(7):
   a=2*math.pi*i/7
   self.plate([(.05*math.cos(a),.78+.05*math.sin(a),-L*.68),(.34*math.cos(a),.78+.34*math.sin(a),-L*.66),(.27*math.cos(a+.24),.78+.27*math.sin(a+.24),-L*.68)],.035,'metal')
 def aircraft(self,kind):
  # aircraft nose +Z. Body profiles define realistic tapered fuselage and cockpit.
  if kind in ('f16','t50','sukhoi'):
   heavy=kind=='sukhoi'; L=3.25 if heavy else 2.95; gray='air'
   self.loft([(-L*.54,.10,.46,.73),(-L*.40,.18,.37,.86),(-L*.10,.25,.32,.95),(L*.16,.22,.34,.90),(L*.38,.13,.41,.79),(L*.50,.025,.56,.65)],gray,16)
   # wings are swept triangular surfaces and wingtip missile rails
   if heavy:
    pts=[(-1.45,.60,-.48),(-.54,.62,-.15),(-.27,.62,.55),(-.35,.60,.79),(-1.37,.60,.15)]
    pts2=[(-x,y,z) for x,y,z in pts]
    self.plate(pts,.09,gray);self.plate(pts2,.09,gray)
    self.plate([(-.72,.71,-1.16),(.72,.71,-1.16),(.40,.71,-.54),(-.40,.71,-.54)],.07,gray)
    for sx in (-1,1):
     self.plate([(sx*.16,.63,-1.25),(sx*.57,.63,-1.22),(sx*.48,.63,-.65),(sx*.20,.63,-.68)],.07,gray)
     self.cyl((sx*.52,.58,-.60),(sx*.52,.58,-1.20),.07,'exhaust',16)
     self.cyl((sx*.52,.58,-1.20),(sx*.52,.58,-1.43),.05,'metal',12)
     self.ellipsoid((sx*.15,.94,-.20),(.17,.055,.22),'glass',14,8)
     self.ellipsoid((sx*.15,.95,.12),(.16,.05,.2),'glass',14,8)
    self.plate([(-.09,.7,-1.27),(-.52,.7,-1.23),(-.36,1.45,-1.06),(-.08,1.45,-1.07)],.07,gray)
    self.plate([(.09,.7,-1.27),(.52,.7,-1.23),(.36,1.45,-1.06),(.08,1.45,-1.07)],.07,gray)
   else:
    self.plate([(-1.14,.66,-.45),(-.25,.67,-.1),(-.16,.66,.77),(-.93,.64,.23)],.08,gray)
    self.plate([(1.14,.66,-.45),(.25,.67,-.1),(.16,.66,.77),(.93,.64,.23)],.08,gray)
    self.plate([(-.55,.66,-1.16),(.55,.66,-1.16),(.25,.66,-.65),(-.25,.66,-.65)],.06,gray)
    self.plate([(-.07,.66,-1.2),(-.42,.66,-1.17),(-.3,1.34,-1.02),(-.06,1.34,-1.03)],.06,gray)
    self.plate([(.07,.66,-1.2),(.42,.66,-1.17),(.3,1.34,-1.02),(.06,1.34,-1.03)],.06,gray)
    self.ellipsoid((0,.94,.03),(.20,.14,.48),'glass',16,10)
    if kind=='t50':self.ellipsoid((0,.94,-.47),(.18,.13,.28),'glass',14,8)
    if kind=='f16':
     self.loft([(-.06,.20,.29,.56),(.23,.17,.22,.48),(.34,.22,.12,.40)],'exhaust',12)
     self.box((0,.34,.14),(.35,.22,.32),'exhaust')
     self.cyl((0,.18,.12),(0,.18,.35),.17,'exhaust',20)
    else:
     for sx in (-1,1):self.box((sx*.48,.38,-.30),(.22,.30,.42),'exhaust')
   for sx in (-1,1):
    self.cyl((sx*.91,.61,-.46),(sx*1.22,.61,-.56),.035,'metal',8)
    self.ellipsoid((sx*1.20,.62,-.54),(.05,.06,.24),'metal',10,6)
   # gear legs and twin/three wheels
   for sx in (-1,1):
    self.cyl((sx*.35,.45,.47),(sx*.39,.13,.64),.035,'metal',8);self.wheel(sx*.39,.11,.67,.10,.08)
   self.cyl((0,.43,-.94),(0,.12,-.86),.035,'metal',8);self.wheel(0,.10,-.86,.11,.08)
  elif kind in ('c130','cn235','nc212'):
   L={'c130':3.5,'cn235':3.0,'nc212':2.65}[kind]; W={'c130':2.75,'cn235':2.30,'nc212':2.0}[kind]
   gray='white' if kind=='cn235' else 'air'
   self.loft([(-L*.53,.10,.43,.70),(-L*.43,.24,.28,.89),(-L*.16,.31,.24,1.02),(L*.30,.31,.24,1.02),(L*.48,.21,.34,.94),(L*.52,.07,.51,.75)],gray,18)
   # high wing with distinct taper and engines/propellers
   self.plate([(-W/2,.98,-.42),(-W*.44,.98,-.25),(W*.43,.98,-.25),(W/2,.98,-.42),(W*.43,.98,.04),(-W*.42,.98,.04)],.11,gray)
   self.plate([(-.50,1.01,-.52),(.50,1.01,-.52),(.34,1.01,-.93),(-.34,1.01,-.93)],.08,gray)
   self.plate([(-.08,.92,-.91),(-.36,.92,-.92),(-.31,1.73,-.84),(-.08,1.73,-.84)],.06,gray)
   self.plate([(.08,.92,-.91),(.36,.92,-.92),(.31,1.73,-.84),(.08,1.73,-.84)],.06,gray)
   cnt=4 if kind=='c130' else 2
   xs=[-W*.36+(W*.72)*i/(cnt-1) for i in range(cnt)]
   for x in xs:
    self.ellipsoid((x,.77,-.29),(.18,.17,.40),'exhaust',14,8)
    self.cyl((x,.77,.02),(x,.77,.20),.045,'metal',10)
    for i in range(4):
     a=i*math.pi/2
     self.plate([(x,.77,.19),(x+.04*math.cos(a),.77+.04*math.sin(a),.19),(x+.31*math.cos(a+.18),.77+.31*math.sin(a+.18),.20),(x+.25*math.cos(a+.18),.77+.25*math.sin(a+.18),.19)],.025,'dark')
   for sx in (-1,1):
    self.box((sx*.19,.85,L*.29),(.11,.16,.04),'glass')
    self.box((sx*.28,.88,L*.30),(.025,.18,.20),'glass')
   # landing gear and cargo cabin windows
   for x in (-.48,.48):
    self.cyl((x,.35,-.08),(x,.12,-.03),.04,'metal',8);self.wheel(x,.11,-.02,.13,.10)
   self.cyl((0,.38,L*.30),(0,.12,L*.34),.04,'metal',8);self.wheel(0,.1,L*.35,.12,.10)
   for x in (-.22,.22):
    for z in (-.24,-.04,.16):self.box((x,1.0,z),(.025,.11,.09),'glass')
  elif kind in ('h225m','panther'):
   L=2.4 if kind=='h225m' else 2.05; shell='green' if kind=='h225m' else 'air'
   # rounded cabin, tapered nose, stepped cockpit and tail boom
   self.ellipsoid((0,.84,.23),(.58,.48,.70),shell,18,12)
   self.ellipsoid((0,.90,.75),(.42,.34,.50),shell,18,12)
   self.box((0,.92,.89),(.67,.44,.05),'glass')
   self.plate([(-.30,.93,.90),(0,.93,1.02),(.30,.93,.90),(.31,.91,.74),(-.31,.91,.74)],.04,'glass')
   for sx in (-1,1):
    self.box((sx*.49,.89,.12),(.035,.32,.38),'glass');self.box((sx*.50,.82,-.25),(.035,.29,.27),'glass')
    self.cyl((sx*.38,.55,.34),(sx*.48,.12,.22),.045,'metal',8);self.cyl((sx*.48,.12,.22),(sx*.53,.12,-.30),.045,'metal',8)
   self.cyl((0,.94,-.15),(0,1.18,-L*.62),.15,shell,14,r2=.045)
   self.plate([(-.07,1.06,-L*.57),(.07,1.06,-L*.57),(.06,1.40,-L*.61),(-.06,1.40,-L*.61)],.045,shell)
   self.plate([(-.09,.92,-L*.62),(.09,.92,-L*.62),(.08,1.04,-L*.82),(-.08,1.04,-L*.82)],.04,shell)
   # four-blade main rotor and tail rotor
   self.cyl((0,1.26,.16),(0,1.57,.16),.055,'metal',10)
   for i in range(4):
    a=i*math.pi/2
    self.plate([(.06*math.cos(a),1.59,.16+.06*math.sin(a)),(.18*math.cos(a),1.59,.16+.18*math.sin(a)),(1.50*math.cos(a+.025),1.59,.16+1.50*math.sin(a+.025)),(1.46*math.cos(a-.02),1.59,.16+1.46*math.sin(a-.02))],.035,'dark')
   self.cyl((.1,1.18,-L*.62),(.28,1.18,-L*.62),.04,'metal',8)
   for i in range(4):
    a=i*math.pi/2;self.plate([(.29,1.18,-L*.62),(.29+.04*math.cos(a),1.18+.04*math.sin(a),-L*.62),(.29+.28*math.cos(a+.1),1.18+.28*math.sin(a+.1),-L*.62)],.025,'dark')
   self.ellipsoid((0,1.30,.16),(.20,.05,.20),'metal',12,6)
 def build(self):
  s=self.slug
  if s=='pindad-ss2':self.rifle()
  elif s in ('leopard-2ri','harimau-medium-tank','pindad-badak-6x6'):self.tank()
  elif s in ('pindad-anoa-6x6','pindad-komodo-4x4','pindad-maung-4x4'):
   self.wheeled_vehicle(6 if 'anoa' in s else 4,s=='pindad-maung-4x4',False)
  elif s=='caesar-155mm':
   self.wheeled_vehicle(6,False,False);self.box((0,1.43,-.53),(.62,.32,.48),'olive')
   self.cyl((0,1.50,-.49),(0,2.35,-1.38),.13,'metal',14);self.cyl((0,2.35,-1.38),(0,2.58,-1.62),.08,'dark',12)
   self.box((0,.30,-1.22),(1.42,.13,.2),'metal')
   for sx in (-1,1):self.cyl((sx*.52,.39,-.62),(sx*.79,.05,-1.54),.055,'metal',10)
  elif s=='astros-ii-mk6':
   self.wheeled_vehicle(6,False,False);self.box((0,1.43,-.53),(1.08,.48,.76),'olive')
   for sx in (-1,1):
    self.box((sx*.30,1.54,-.48),(.48,.54,.83),'dark')
    for i in range(5):self.cyl((sx*.30,1.39+i*.07,-.06),(sx*.30,1.39+i*.07,-.91),.09,'metal',10)
   self.cyl((0,.35,-1.30),(0,.04,-1.85),.06,'metal',10)
  elif s.startswith('kapal-selam'):self.sub()
  elif s in ('fregat-kelas-martadinata','korvet-kelas-bung-tomo','korvet-kelas-diponegoro','kapal-amfibi-kelas-makassar','kcr-60m-sampari'):
   k={'fregat-kelas-martadinata':'martadinata','korvet-kelas-bung-tomo':'bung','korvet-kelas-diponegoro':'diponegoro','kapal-amfibi-kelas-makassar':'makassar','kcr-60m-sampari':'sampari'}[s];self.ship(k)
  elif s in ('f-16-fighting-falcon','kai-t-50i-golden-eagle','sukhoi-su-27-su-30'):
   self.aircraft({'f-16-fighting-falcon':'f16','kai-t-50i-golden-eagle':'t50','sukhoi-su-27-su-30':'sukhoi'}[s])
  elif s in ('c-130-hercules','cn-235-220','nc212i'):
   self.aircraft({'c-130-hercules':'c130','cn-235-220':'cn235','nc212i':'nc212'}[s])
  elif s in ('h225m-caracal','as565-mbe-panther'):
   self.aircraft('h225m' if s=='h225m-caracal' else 'panther')
  return self
 def write(self,path):
  # Center the footprint on the origin and put the lowest point on the ground plane.
  points=[p for tris in self.tris.values() for tri in tris for p in tri]
  cx=(min(p[0] for p in points)+max(p[0] for p in points))/2
  cz=(min(p[2] for p in points)+max(p[2] for p in points))/2
  floor=min(p[1] for p in points)
  self.tris={mat:[tuple((p[0]-cx,p[1]-floor,p[2]-cz) for p in tri) for tri in tris] for mat,tris in self.tris.items()}
  blob=bytearray(); views=[]; accessors=[]; primitives=[]
  def align():
   while len(blob)%4:blob.append(0)
  for mat,tris in self.tris.items():
   flat=[p for tri in tris for p in tri]; norms=[]
   for i in range(0,len(flat),3):
    a,b,c=flat[i:i+3]; u=[b[k]-a[k] for k in range(3)];v=[c[k]-a[k] for k in range(3)]
    n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];d=math.sqrt(sum(x*x for x in n)) or 1
    n=[x/d for x in n];norms.extend(n*3)
   align();off=len(blob)
   for p in flat:blob.extend(struct.pack('<3f',*p))
   views.append({'buffer':0,'byteOffset':off,'byteLength':len(blob)-off,'target':34962}); pv=len(views)-1
   align();noff=len(blob)
   for i in range(0,len(norms),3):blob.extend(struct.pack('<3f',*norms[i:i+3]))
   views.append({'buffer':0,'byteOffset':noff,'byteLength':len(blob)-noff,'target':34962}); nv=len(views)-1
   mins=[min(p[k] for p in flat) for k in range(3)];maxs=[max(p[k] for p in flat) for k in range(3)]
   accessors.append({'bufferView':pv,'componentType':5126,'count':len(flat),'type':'VEC3','min':mins,'max':maxs});pa=len(accessors)-1
   accessors.append({'bufferView':nv,'componentType':5126,'count':len(flat),'type':'VEC3'});na=len(accessors)-1
   primitives.append({'attributes':{'POSITION':pa,'NORMAL':na},'material':list(MATS).index(mat),'mode':4})
  gltf={'asset':{'version':'2.0','generator':'Katalog Alutsista Interaktif — original CC0 procedural models'},'scene':0,'scenes':[{'nodes':[0]}], 'nodes':[{'name':self.slug,'mesh':0}], 'meshes':[{'name':self.slug,'primitives':primitives}], 'materials':[{'name':k,'pbrMetallicRoughness':{'baseColorFactor':v[0],'metallicFactor':v[2],'roughnessFactor':v[1]},'doubleSided':True} for k,v in MATS.items() if k in self.tris], 'accessors':accessors,'bufferViews':views,'buffers':[{'byteLength':len(blob)}]}
  # primitive material indices must index the compact used-material array
  used=list(self.tris); 
  for pr,mat in zip(primitives,self.tris):pr['material']=used.index(mat)
  j=json.dumps(gltf,separators=(',',':')).encode(); j+=b' '*((-len(j))%4); align(); total=12+8+len(j)+8+len(blob)
  with open(path,'wb') as f:f.write(struct.pack('<III',0x46546c67,2,total));f.write(struct.pack('<II',len(j),0x4e4f534a));f.write(j);f.write(struct.pack('<II',len(blob),0x004e4942));f.write(blob)

SLUGS=['leopard-2ri','harimau-medium-tank','pindad-anoa-6x6','pindad-badak-6x6','pindad-komodo-4x4','pindad-maung-4x4','caesar-155mm','astros-ii-mk6','pindad-ss2','kapal-selam-kelas-nagapasa','kapal-selam-kelas-cakra','fregat-kelas-martadinata','korvet-kelas-bung-tomo','korvet-kelas-diponegoro','kapal-amfibi-kelas-makassar','kcr-60m-sampari','f-16-fighting-falcon','sukhoi-su-27-su-30','kai-t-50i-golden-eagle','c-130-hercules','cn-235-220','nc212i','h225m-caracal','as565-mbe-panther']
for slug in SLUGS:
 m=Model(slug).build(); m.write(os.path.join(OUT,slug+'.glb'))
 print(f'{slug}.glb {os.path.getsize(os.path.join(OUT,slug+".glb")):,} bytes')
