import React, { useContext, useState, useEffect } from 'react';

function Setting() {
  const [inputRpc, setInputRpc] = useState('');
  const [inputLcd, setInputLcd] = useState('');
  // const [] = useState('');

  useEffect(() => {
    const feachState = async () => {
      const responseLocalSetting = await localStorage.getItem('setting');
      console.log(`responseLocalSetting`, responseLocalSetting);
    };
    feachState();
  }, []);

  const setUpLcd = async () => {};

  const setUpRpc = async () => {};

  return (
    <main>
      <input
        type="text"
        onChange={(e) => setInputRpc(e.target.value)}
        value={inputRpc}
      />
      <button type="button" onClick={setUpRpc()}>
        set up
      </button>

      <input
        type="text"
        onChange={(e) => setInputLcd(e.target.value)}
        value={inputLcd}
      />
      <button type="button" onClick={setUpLcd()}>
        set up
      </button>
    </main>
  );
}

export default Setting;
