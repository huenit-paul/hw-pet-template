'use client'

import type { ConnectionState } from '@ktaicoder/hw-pet'
import { HPet, HPetEventKeys } from '@ktaicoder/hw-pet'
import { Box, ButtonBase, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { HW_ID, HW_NAME } from '@/constant'
import { CommandRunner } from '@/hw/CommandRunner'

const LOGO_IMG_URL = 'logo.png'

const BLUETOOTH_IMG_URL = 'bluetooth.svg'

export default function Page() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')

  const [commandRunner, setCommandRunner] = useState<CommandRunner>()

    const [port, setPort] = useState(null)
    const connectSerial = async () => {
        try {
            setConnectionState('connecting');
            // const newPort = await navigator.serial.requestPort();
            const port = await navigator.serial.requestPort();

            console.log('port_name : ', port);
            // await newPort.open({ baudRate: 115200 });
            await port.open({ baudRate: 115200 });
            // setPort(newPort);
            if (commandRunner){
                commandRunner.setPort(port);
                setConnectionState('connected');
            }
            // 이제 원하는 작업 수행
            // port 을 사용하여 데이터를 전송하거나 수신할 수 있음
        } catch (error) {
            console.error('Error connecting to serial port:', error);
            setConnectionState('disconnected');
        }
    };

  // Click handler for the Connect button
  const handleClickConnectBtn = () => {
    //const runner = commandRunner
    //if (!runner) return
    //runner.connect()
    connectSerial()
    console.log("serial connect click")
  }

  // Click handler for the Disconnect button
    const handleClickDisconnectBtn = async () => {
        try {
            if (port) {
                await port.close();
            }
            setPort(null);
            setConnectionState('disconnected');
        } catch (error) {
            console.error('Error disconnecting from serial port:', error);
        }
    };



  useEffect(() => {
    const pet = new HPet({
      hwId: HW_ID,
      commandRunnerClass: CommandRunner,
    })

    pet.on(HPetEventKeys.CommandRunner.stateChanged, (data) => {
      const { state, commandRunner } = data
      if (state === 'started') {
        setCommandRunner(commandRunner as CommandRunner)
      } else {
        setCommandRunner(undefined)
      }
    })
    pet.on(HPetEventKeys.connectionStateChanged, setConnectionState)

    pet.start()

    return () => {
      // all event listeners will be automatically removed
      pet.stop()
      setCommandRunner(undefined)
    }
  }, [])

  return (
    <Box
      sx={{
        pt: 2,
        bgcolor: '#fff',
        '& .x_bottom_buttons': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 0,
          height: 40,
          bgcolor: 'primary.main',
          color: '#fff',
          width: '100%',
          '&.x_connected': {
            bgcolor: 'success.main',
          },
          '&.x_disconnected': {
            bgcolor: 'primary.main',
          },
          '&.x_connecting': {
            bgcolor: '#e91e63',
          },
        },
      }}
    >
      <Box
        sx={{
          m: '0 auto',
          width: '100%',
          maxWidth: '100px',
          '& img': {
            width: '100%',
            height: 100,
            objectFit: 'contain',
          },
        }}
      >
        <img src={LOGO_IMG_URL} alt="" />
      </Box>
      <Typography
        variant="h6"
        sx={{
          textAlign: 'center',
          fontWeight: 700,
          color: '#000',
          mt: 1,
        }}
      >
        {HW_NAME.en}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 1,
        }}
      >
        <img src={BLUETOOTH_IMG_URL} alt="" width={24} height={24} />
      </Box>

      {connectionState === 'connected' && (
        <ButtonBase
          className="x_bottom_buttons x_connected"
          component="div"
          onClick={handleClickDisconnectBtn}
        >
          <span>Connected</span>
        </ButtonBase>
      )}

      {connectionState === 'disconnected' && (
        <ButtonBase
          className="x_bottom_buttons x_disconnected"
          component="div"
          onClick={handleClickConnectBtn}
        >
          <span>Disconnected</span>
        </ButtonBase>
      )}

      {connectionState === 'connecting' && (
        <Box className="x_bottom_buttons x_connecting">
          <span>Connecting...</span>
        </Box>
      )}
    </Box>
  )
}
