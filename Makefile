#in this file i have `apps` aliased to apps.zenduit.com
upclient:
	scp js/bundle.js apps:/lamp/apps/ZenduMessenger/js/
upall:
	tar --exclude="node_modules" -cpf ../ZenduMessenger.tar.gz * 
	cat ../ZenduMessenger.tar.gz | ssh apps "cd /lamp/apps/ZenduMessenger ; tar xvpf -" 
babel:
	babel -w app -d build
watchify:
	watchify build/app.js -o js/bundle.js
