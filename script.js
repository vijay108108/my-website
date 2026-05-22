// Premium card interactions: tilt, parallax icon, and keyboard focus support
console.log("Website loaded");

(function(){
	const cards = document.querySelectorAll('.service-card');

	function onMove(e){
		const card = e.currentTarget;
		const rect = card.getBoundingClientRect();
		const x = ('touches' in e) ? e.touches[0].clientX : e.clientX;
		const y = ('touches' in e) ? e.touches[0].clientY : e.clientY;
		const px = (x - rect.left) / rect.width;
		const py = (y - rect.top) / rect.height;

		const rotateY = (px - 0.5) * 14;
		const rotateX = (0.5 - py) * 14;

		card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

		const icon = card.querySelector('.service-card__icon');
		if (icon) {
			const ix = (px - 0.5) * 18;
			const iy = (py - 0.5) * 10;
			icon.style.transform = `translateZ(40px) translate(${ix}px, ${iy}px) rotate(${ix * 0.18}deg)`;
		}
	}

	function onEnter(e){
		e.currentTarget.classList.add('is-hovered');
	}

	function onLeave(e){
		const card = e.currentTarget;
		card.classList.remove('is-hovered');
		card.style.transform = '';
		const icon = card.querySelector('.service-card__icon');
		if (icon) icon.style.transform = '';
	}

	cards.forEach(card => {
		if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex','0');

		card.addEventListener('mousemove', onMove);
		card.addEventListener('touchmove', onMove, {passive: true});
		card.addEventListener('mouseenter', onEnter);
		card.addEventListener('mouseleave', onLeave);

		card.addEventListener('focusin', onEnter);
		card.addEventListener('focusout', onLeave);
	});
})();
