'use strict';

module.exports = (NODE) => {
  const triggerIn = NODE.getInputByName('trigger');
  const nextIn = NODE.getInputByName('next');
  const anyIn = NODE.getInputByName('any');

  const triggerOut = NODE.getOutputByName('trigger');
  const doneOut = NODE.getOutputByName('done');

  function next(value, state, values, index) {
    const thisState = state.split();
    thisState.set(NODE, {
      value,
      index,
      values
    });
    triggerOut.trigger(thisState);

    if (index + 1 >= values.length) {
      doneOut.trigger(state);
    }
  }

  triggerIn.on('trigger', async (conn, state) => {
    const values = await anyIn.getValues(state);

    if (!nextIn.isConnected()) {
      values.forEach((value, index) => next(value, state, values, index));

      return;
    }

    next(values[0], state, values, 0);
  });

  nextIn.on('trigger', async (conn, state) => {
    const thisState = state.get(NODE);
    if (thisState && typeof thisState.index === 'number') {
      if (thisState.index + 1 >= thisState.values.length) {
        return;
      }
      next(thisState.values[thisState.index + 1], state, thisState.values, thisState.index + 1);
    }
  });

  const itemOut = NODE.getOutputByName('item');
  itemOut.on('trigger', async (conn, state) => {
    const thisState = state.get(NODE);
    if (thisState && thisState.value !== undefined && thisState.value !== null) {
      return thisState.value;
    }
  });
};
