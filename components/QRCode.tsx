import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Svg, Rect } from 'react-native-svg';
import QRCodeGenerator from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  color = '#000000',
  backgroundColor = '#FFFFFF'
}) => {
  const [qrCodeData, setQrCodeData] = React.useState<boolean[][]>([]);

  React.useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Generate QR code data
        const qrCodeMatrix = await QRCodeGenerator.create(value, {
          errorCorrectionLevel: 'M'
        });
        
        // Convert to boolean matrix
        const matrix = qrCodeMatrix.modules.map((row: boolean[]) => 
          row.map((cell: boolean) => Boolean(cell))
        );
        
        setQrCodeData(matrix);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [value]);

  if (qrCodeData.length === 0) {
    return <View style={[styles.container, { width: size, height: size, backgroundColor }]} />;
  }

  const cellSize = size / qrCodeData.length;

  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
      <Svg width={size} height={size}>
        {qrCodeData.map((row, rowIndex) =>
          row.map((cell, cellIndex) => {
            if (cell) {
              return (
                <Rect
                  key={`${rowIndex}-${cellIndex}`}
                  x={cellIndex * cellSize}
                  y={rowIndex * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill={color}
                />
              );
            }
            return null;
          })
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QRCode;