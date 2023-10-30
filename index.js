AFRAME.registerComponent('drag-rotate', {
  schema: {
    speed: { default: 1 }
  },

  init: function () {
    this.dragging = false;
    this.startPosition = new THREE.Vector3();
    this.pointerPosition = new THREE.Vector3();
    this.el.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.el.sceneEl.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.el.sceneEl.addEventListener('touchend', this.onMouseUp.bind(this));
    this.el.sceneEl.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.el.sceneEl.addEventListener('touchmove', this.onTouchMove.bind(this));
  },

  onMouseDown: function (event) {
    this.dragging = true;
    this.el.object3D.getWorldPosition(this.startPosition);
    this.pointerPosition.set(event.detail.intersection.point.x, event.detail.intersection.point.y, event.detail.intersection.point.z);
  },

  onMouseUp: function () {
    this.dragging = false;
  },

  onMouseMove: function (event) {
    if (this.dragging) {
      const intersection = event.detail.intersection;
      if (intersection) {
        const newPosition = new THREE.Vector3().subVectors(intersection.point, this.pointerPosition);
        this.el.object3D.position.copy(this.startPosition.clone().add(newPosition));
      }
    }
  },

  onTouchMove: function (event) {
    if (this.dragging) {
      const touch = event.touches[0];
      if (touch) {
        const newPosition = new THREE.Vector3().subVectors(touch.point, this.pointerPosition);
        this.el.object3D.position.copy(this.startPosition.clone().add(newPosition));
      }
    }
  }
});
