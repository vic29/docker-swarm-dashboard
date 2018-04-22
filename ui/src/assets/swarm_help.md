# Swarm használati kézikönyv

## Hasznos API gyűjtemény
##### Elérhető random port
```sh
curl -s {URL}/freeport
```
Változóban felhasználva:
```sh
PORT=$(curl -s {URL}/freeport)
echo $PORT
```
##### Docker image törlés
```sh
curl -s {URL}/delete/image?name=repoName/imageName:tag
```
##### Docker Stack törlés
```sh
curl -s {URL}/delete/stack?name=stackName
```
##### Docker Service törlés
```sh
curl -s {URL}/delete/service?name=serviceName
```

## Autoclean funkció
Hogy kiküszübüljük a gazdátlan gépeket, amiről senki nem tud semmit,vagy a túlzott erőforrásfelhasználást, ezért kötelezővé tettünk pár dolgot:
- Minden ecosystem-nek lennie kell egy label-nek, ami leírja mi az, ki, és miért hozta létre. A label neve pedig **loxon.info** legyen, értéke pedig a környezetet leíró szöveg, akár HTML formátumban.
- Definiálni kell a service-ek erőforrásigényét (CPU + Memória)
-- **Reserve**: Mennyi az a CPU mag, vagy memória, amit mindenképp lefoglalunk a service számára. Ezt neki delegálja a swarm. A lefoglalt erőforrás <= elérhető erőforrás. Ha már **nem férne el** az új service, akkor azt **el sem indítja**! Megadása nem kötelező, ekkor nincs garantálva semmi.
-- **Limit**: Mennyi az a CPU mag, vagy memória, amit a **service maximum használhat**. Ezek összege lehet több is mint a rendelkezésre álló erőforrás.

Erőforrásigény definiálásának több előnye is van:
- Definiáljuk hogy biztosan, és maximum mennyit akarunk a közösből használni, és nem mindenki a közös maximumot használja.
- lehetőség nyílik, hogy a service-eket ne egyenletes elosztás segítségével ossza szét a swarm a worker-ek között, így minden gépet a lehetőségeihez képest maximálisan tudjuk kihasználni.

## Ecosystem létrehozása
### Egyedüli service létrehozása
Kötelező paraméterek:
```sh
docker service create --with-registry-auth --log-opt max-size=10m --label loxon.info="Ez egy fontos környezet, HTML kódot is rakhatok ide" --limit-cpu "2" --limit-memory "200m" docker.loxon.eu/pelda/image
```
Opcionális paraméter:
```
--reserve-cpu "0.1" --reserve-memory "10m"
```

### Több service (ecosystem) létrehozása
Egy példa docker-compose.yml file:
```
version: '3.4'
services:
  my-service-1:
    image: nginx
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: "200m"
        reservations:
          cpus: "0.1"
          memory: "50m"
      labels:
        loxon.info: "My <strong>very important</strong> ecosystem"
    logging:
      driver: json-file
      options:
        max-size: "5000k"
        max-file: "5"
```

## Swarm indexpage extra funkciói
- Review névkonvenció: Ha egy review következtében jön létre egy ecosystem, és az ecosystem neve illeszkedik a `r\d+` patternre, akkor a gerrit rendszerből lekéri a review adatokat, és megjeleníti.
- Ha létezik a loxon.elk label, melynek éréke egy URL a környezet szűrési paramétereivel, akkor azt a táblázatos nézetben a név mellé kirakjuk icon-ként, hogy gyorsan oda lehessen ugrani.

## Alapismeretek
**Kernel virtualizáció**:
Linux Kernel virtualizáció segítségével nincs szükség teljes virtualizációt futtatni mint VmWare/Virtualbox esetében, hanem a Guest operációs rendszer (amennyiben kernel alapú) a host kernelével vegyülve, virtuális layer nélkül natívan képes futni a host-on. Így egy host-on akár több ezer guest is futhat, mert nincsenek felesleges erőforrás foglalások.

**Docker**
Kernel virtualizációt kihasználva a docker egy olyan szolgáltatás a virtualizáció felett, mely képes linux gépeket programozottan (script segítségével) előállítani, feltölteni egy tárhelyre (privát, vagy publikus felhőbe), bárhol letölteni az gépet, és futtatni.

Alap elgondolása, hogy egy így készített gép csak egy szolgáltatásért felelős (Kernel virtualizáció miatt úgy sincs költsége a gépeknek), így könyebbben lehet variálni a szolgáltatásokat egymással.

Példa: Egy ecosystemet előállíthatunk például:
- tomcat + java war - 3 példányban
- MySQL
- Redis: key-value store
- Nginx: proxy és loadbalancer

**Docker image**:
Ez a sablon/template gép, amelyet a felhőbe feltöltünk, és majd példányosítani fugunk. Ezt az image-et állítjuk elő docker script segítségével.
Az image neve, és verziója egyértelműen beazonosítja.

Névfelépítés:
`repository_url / repository_név / szolgáltatás_név : verzió`
Példa:
- `docker.loxon.eu`/`collection`/`weblogic-12.1.3-collection-hci`:`release-17` // Loxon repository-ban lévő collection repository HCI weblogic 12.1.3 szolgáltatása, amelybe a 17-es release állományokat is beletelepítették.
- `jboss`/`wildfly`:`11.0.Final` // Ha nincs repository, akkor a https://hub.docker.com az default
- `openjdk`:`8` // Sokszor nincs repository sem, mivel ezek "minősített" beszállítók, a docker hivatalosnak fogadja el őket.
- `mongo` // még verzió sem kötelező. Default verzió a "latest", amelyet fordítás során beállítanak a készítők egy verzióra

**Image öröklődés**
Hogy ne kelljen mindenkinek mindent előről kezdenie lehetőség van egy meglévő image-ből kiindulni (annak minden tulajdonságát megörököljük), és továbbiakat adhatunk hozzá (csak egy ős-image lehet). Így tetszőleges öröklési fát felépíthetünk.

**Image Layer**
Ha minden változtatás az image-ben a teljes image lementését jelentené, akkor mind a tárhely, mind a hálózat nagyon szűk keresztmetszet lenne.
Ezért a változtatásokat layer-ekbe szervezi a docker (ezek a diff-ek), és ha letöltünk egy image-et, akkor csak a layerek jönnek le (ha még nem volt megünk), majd a végén összerakja a gépünk. Így a hálózat, és a tárhely használat is "kevés"

Különösen fontos minden készítőnek, hogy mindig a minimálisat módosítsanak, mert ellenkező esetben nagy layer-ek keletkeznek. Példa:
- a `chmod -R 777 /var` parancs során a layer a teljes /var mappa tartalmát tartalmazni fogja, pedig csak meta infó változott rajta.
- `/tmp` vagy `/var/cache` vagy csomagkezelő temp könyvtárát is takarítani szokák a telepítés végén, nehogy felesleges layer keletkezzen.

**Mi az az alpine?**
Az image-ek mérete gyakran nagy, és sok olyat tartalmaz alapból, amelyre nincs is szükség, ezért készült egy nagyon sik méretű linux (kb 50MB), ami gyors, sallangoktól mentes. Ez az alpine. A legtöbb gyártó erre is elkészíti a szolgáltatását, és a tag-ben feltünteti azt.

**Image készítés**
Ilyen image-et két féle képp tudunk előállítani:
 - Programozottan, vagyis egy script file (**Dockerfile**) tartalmazza a kiindulási image-et, és a rajta végzett módosításokat. Ezt a `docker build -t image_név:_tag .` parancsal le is fordíthatjuk. Ez bármikor bárhol reprodukálható, újrafuttatható. Script file lehetőségeiről: https://docs.docker.com/engine/reference/builder
 - Elindítjuk az alap image-et, és futás közben végezzük el rajta a módosításokat kézzel, majd az elindított szolgáltatást kommitoljuk be egy verzióba. `docker commit futo_gep_azonosító image_név:_tag` Ez a legető legrosszabb irány, ugyanis csak a végeredményt mentjük le, azt a készítőjén kívül senki nem tudja mi történt az image-el, nem reprodukálható.

**Docker Container**:
Egy image futó példánya a container. Minden container rendelkezik egy ID-val, illetve értelmes nevet is lehet/érdemes neki adni. Image készítésénél kiajánlhatunk portot, belső könyvtárat, environment variable-t, és azokat a container indítása során specifikálhatjuk, vagy akár a host-ra mappelhetjük is. Pl a belső 80-as port a host-on a 8080 legyen. Vagy a belső /opt/data könyvát a hoston a /var/data legyen. Bármilyen könyvtárat, filet át lehet mappelni a host-ról a guest-re. Fontos a **Container nem állapottartó**, tehát megszünése esetén minden adat elvész ami nem volt átmappelve!
Minden Container **addig fut csak, amíg a fő szolgáltatása fut** ( lásd Dockerfile CMD parancs). Ha az megáll, akkor a container is megáll.
Tipikus Dockerfile:
```
    FROM ubuntu:zesty // Ez a kiinduló image és tag-je (verziója)

    RUN mkdir -p /opt/data // RUN parancs segítségével linuxos parancsokat tudunk futtatni

    COPY host_forrás guest_cél // könyvtár/file másolása host és image között

    ENV FONTOS_ENV_VALTOZO="fontos érték" // Environment variable-t tudunk beállítani a guest-nek, ami példányosításkor felülírható

    EXPOSE 80 // kiajánljuk a 80-as portot. futtatási paraméter -ben ezt át tudjuk mappelni a hoston egy saját portra. Na nincs map, akkor automatikusan nem generál a host-on, vagyis ezen a porton nincs kívülről elérhető szolgáltatás.

    CMD /opt/myapp.start.sh $FONTOS_ENV_VALTOZO // Elindítjuk a fő szolgáltatásunkat. Amíg ez fut, addig fut a container is.
```

**Build folyamata**:
Fordítani a Dockerfile könyvtárából:
```sh
docker build --pull -t image_név:tag .
```
Minden olyan állomány, mely szükséges a build-hez az ebben a könyvtárban (vagy alkönyvtár) kell lennie!
A docker a build folyamat során elindít egy konténert az alap image-ből, és lejátsza a parancsokat rajta, majd leállítva, készít egy imaget belőle ( ~ docker commit ), és törli az átmeneti containert.

**Docker registry**
Image-ek tárolója. Van opensource szolgáltatások számára HUB (hub.docker.com), van fizetős szolgáltatások számára Store (store.docker.com), illetve bárki könnyedén készíthet saját registry-t (ami szintén egy dockeres image: https://hub.docker.com/_/registry/, de ennek nincs grafikus felülete, csak api-ja, és mi használunk felette egy webes felületet: https://github.com/vmware/harbor)
Loxon registry elérése: https://docker.loxon.eu

**Docker network**: Több szolgáltatást egy hálózatba lehet foglalni (amolyan DMZ), hálózaton belül minden container látja a másikat (példányosított név alapján), és minden belső portot látnak.
Ezért lehet az, hogy van egy proxy szerverem, 3 alkalmazás szerver, és 1 db szerver. Ekkor a hálózatból elég kiajánlani a proxy szervert, a többieket nem. Ezt kézzel kezelni macerás, kényelmesebb a docker-compose, illetve a docker stack (lásd később)

**Docker compose**: Több szolgáltatásból álló halmazt tudok kezeni vele. A leíró file egy `yml` file, melybe felsorounk mindent, ami a container létrehozásához, paraméterezéséhez szükséges. Ezt a `yml` file-t kell csak behivatkozni indításkor. Bővebben: https://docs.docker.com/compose/compose-file/

### NEM swarm parancsok
(Egygépes környezeten értelmezett parancsok)
**Docker run**:
Image futtatása egy hoston, vagyis ez készít el egy új Containert az adott hostra.
https://docs.docker.com/engine/reference/run/
Minden docker run mapping paraméter esetén a szintaxis ez "HOST:GUEST" vagyis a -p 8080:80 az jelenti hogy a guest 80-as portja a hoston 8080 legyen.
Példa:
```sh
docker run -d --name my-nginx -p 8080:80 -v /opt/host_nginx_dir:/usr/share/nginx/html:ro nginx:1.13-alpine
```

**Docker start, stop, rm**: Meglévő futó Containert tudunk leállítani, újra elindítani, és törölni.
```sh
docker rm -f containerId || containerName
docker stop containerId || containerName
docker start containerId || containerName
docker logs -f containerId || containerName
```

### Swarm
**Docker swarm**: A docker run minden containert egy gépen indítot el. De ha nem fér el a sok-sok ecosystem-ünk egy gépre, akkor az eddigi parancsokkal nem tudjuk megoldani a helyzetet. Ezért a docker kialakított egy cloud szolgáltatást, ahova a fizikai vasakat (vagyis a hostokat) becsatlakoztatjuk egy swarm egységbe, ahol vannak manager, és worker gépek. A swarm manager többek között automatikusan elvégzi a container-ek elosztását a hostok között, összekötését, DockerNetwork kialakítását. Felel továbbá azért is, hogy ha megszűnik egy worker a swarm-ban, akkor ami ott futott azt máshol automatikusan elindítja.
Swarm doksi:
 - https://docs.docker.com/engine/swarm/admin_guide/
 - https://docs.docker.com/engine/swarm/

**docker service**
A *service* egyetlen container neve a swarm egységben. Egy service indítása hasonló a `docker run` parancshoz.
Service parancsok:
- új service létrehozása (manager gépen)
```sh
docker service ls
docker service create --name my-nginx -p 12970:80 nginx
docker service logs -f my-nginx
docker service rm my-nginx
```
Bővebben: https://docs.docker.com/engine/reference/commandline/service

**docker stack**
Stack-nek nevezzük azt az ecosystem-et, ami több szolgáltatásból épül fel.
A szolgáltatások definícióját, beállítását a fent említett `docker-compose.yml` segítségével adjuk meg, és indítjuk el a stack-et, ami service-eket készít belőle a megfelelő módon.
```sh
docker stack deploy -c my-compose-file.yml myStackName
docker stack ls
docker stack services myStackname // listázzuk a service-ek nevét
docker stack rm myStackName
```
Bővebben: https://docs.docker.com/engine/reference/commandline/stack

#### Swarm kezelés
**Swarm létrehozása**:
https://docs.docker.com/engine/reference/commandline/swarm_init/ )

    docker swarm init --advertise-addr <SERVER-IP>

**Új worker csatlakoztatása a meglévő swarm-ba**:
https://docs.docker.com/engine/reference/commandline/swarm_join/

 1. Join parancs generálása a manager gépen: `docker swarm join-token worker`
 2. a kapott parancs lefuttatása a csatlakozni kívánó gépen.
 3. Visszaellenőrzés, a manager gépen megnézzük az új gépet: `docker node ls`

**Mit használunk ezekből a Loxon-nál**:
* GIT-ben tároljuk az image előállításához szükséges Dockerfile, és egyébb forrás állományokat
* Swarm-ot használunk, mivel sok szolgáltatásunk van, 1 gépen nem férünk el
* Szinte minden esetben docker stack-et használunk, mivel több szolgáltatást használunk egyként (weblogic admin, weblogic node 1-2-..., proxy server)
* Oracle DB is volt próbaként dockerben, de sajnos nem jó, sokat eszik, és nagyon macerás
