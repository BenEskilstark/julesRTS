const subtract = (vecA, vecB) => {
  return {
    x: vecA.x - vecB.x,
    y: vecA.y - vecB.y,
  };
};

const vectorTheta = (vec) => {
  return Math.atan2(vec.y, vec.x);
};

module.exports = {
  subtract,
  vectorTheta,
};
