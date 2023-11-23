//Código para detectar superficie, detectar al usuario tocando la pantalla (y dónde) y colocando el modelo únicamente con el primer toque.
let modelPlaced = false; // Variable para rastrear si el modelo ya se colocó

    async function activateXR() {
      // Add a canvas element and initialize a WebGL context that is compatible with WebXR.
      const canvas = document.createElement("canvas");
      document.body.appendChild(canvas);
      const gl = canvas.getContext("webgl", {
        xrCompatible: true
      });

      const scene = new THREE.Scene();

      // Add directional light to the scene
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
      directionalLight.position.set(10, 15, 10);
      scene.add(directionalLight);

      // Set up the WebGLRenderer, which handles rendering to the session's base layer.
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        preserveDrawingBuffer: true,
        canvas: canvas,
        context: gl
      });
      renderer.autoClear = false;

      // The API directly updates the camera matrices.
      // Disable matrix auto updates so three.js doesn't attempt
      // to handle the matrices independently.
      const camera = new THREE.PerspectiveCamera();
      camera.matrixAutoUpdate = false;

      // Initialize a WebXR session using "immersive-ar" with hit-test feature.
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ['hit-test']
      });
      session.updateRenderState({
        baseLayer: new XRWebGLLayer(session, gl)
      });

      // Initialize hit-test source
      const hitTestSourceSpace = await session.requestReferenceSpace('viewer');
      const hitTestSource = await session.requestHitTestSource({
        space: hitTestSourceSpace
      });

      // A 'local' reference space has a native origin that is located
      // near the viewer's position at the time the session was created.
      const referenceSpace = await session.requestReferenceSpace('local');

      // Create a GLTF loader
      const loader = new THREE.GLTFLoader();

      // Load reticle model
      let reticle;
      loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/reticle/reticle.gltf", function (gltf) {
        reticle = gltf.scene;
        reticle.visible = false;
        scene.add(reticle);
      });

      // Load sunflower model
      let flower;
      loader.load("https://raw.githubusercontent.com/lolaaltamirano8/lolaaltamirano8.github.io/main/prensa_husillo.gltf", function (gltf) {
        flower = gltf.scene;
      });

      // Create a render loop that allows us to draw on the AR view.
      const onXRFrame = (time, frame) => {
        // Queue up the next draw request.
        session.requestAnimationFrame(onXRFrame);

        // Bind the graphics framebuffer to the baseLayer's framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer)

        // Retrieve the pose of the device.
        // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
        const pose = frame.getViewerPose(referenceSpace);
        if (pose) {
          // In mobile AR, we only have one view.
          const view = pose.views[0];

          const viewport = session.renderState.baseLayer.getViewport(view);
          renderer.setSize(viewport.width, viewport.height)

          // Use the view's transform matrix and projection matrix to configure the THREE.camera.
          camera.matrix.fromArray(view.transform.matrix)
          camera.projectionMatrix.fromArray(view.projectionMatrix);
          camera.updateMatrixWorld(true);

          // Perform hit testing using the viewer as origin.
          const hitTestResults = frame.getHitTestResults(hitTestSource);
          if (hitTestResults.length > 0 && reticle) {
            const hitPose = hitTestResults[0].getPose(referenceSpace);
            reticle.visible = true;
            reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z)
            reticle.updateMatrixWorld(true);
          }

          // Render the scene with THREE.WebGLRenderer.
          renderer.render(scene, camera)
        }
      }
      session.requestAnimationFrame(onXRFrame);

      // Event listener for the "select" event (user pressing the screen)
      session.addEventListener("select", (event) => {
        if (flower && !modelPlaced == true) { // Verificar si el modelo existe y aún no se ha colocado
          const clone = flower.clone();
          clone.position.copy(reticle.position);
          scene.add(clone);
          modelPlaced = true; // Actualizar la variable para indicar que el modelo se ha colocado
        }
      });
    }
