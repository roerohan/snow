import { useMemo, useEffect } from 'react';
import { useLoader, useThree, useFrame } from 'react-three-fiber';
import {
  SMAAImageLoader,
  BlendFunction,
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  SSAOEffect,
  NormalPass,
} from 'postprocessing';

// Fix smaa loader signature
const _load = SMAAImageLoader.prototype.load;
SMAAImageLoader.prototype.load = function loader(_, set) { return _load.bind(this)(set); };

export default function Post() {
  const {
    gl, scene, camera, size,
  } = useThree();
  const smaa = useLoader(SMAAImageLoader);
  const composer = useMemo(() => {
    const comp = new EffectComposer(gl);
    comp.addPass(new RenderPass(scene, camera));
    const smaaEffect = new SMAAEffect(...smaa);
    smaaEffect.colorEdgesMaterial.setEdgeDetectionThreshold(0.1);
    const normalPass = new NormalPass(scene, camera);
    const ssaoEffect = new SSAOEffect(camera, normalPass.renderTarget.texture, {
      blendFunction: BlendFunction.MULTIPLY,
      samples: 30,
      rings: 4,
      distanceThreshold: 1,
      distanceFalloff: 0.0,
      rangeThreshold: 0.05,
      rangeFalloff: 0.01,
      luminanceInfluence: 0.6,
      radius: 30,
      scale: 0.55,
      bias: 0.5,
    });
    const effectPass = new EffectPass(camera, smaaEffect, ssaoEffect);
    effectPass.renderToScreen = true;
    comp.addPass(normalPass);
    comp.addPass(effectPass);
    return comp;
  }, [camera, gl, scene, smaa]);

  useEffect(() => composer.setSize(size.width, size.height), [size, composer]);
  return useFrame((_, delta) => composer.render(delta), 1);
}
