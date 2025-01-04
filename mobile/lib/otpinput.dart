import 'package:flutter/material.dart';
import 'package:pinput/pinput.dart';

class Otpinput extends StatefulWidget {
  const Otpinput({super.key});

  @override
  State<Otpinput> createState() => _OtpinputState();
}

class _OtpinputState extends State<Otpinput> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Enter OTP')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Pinput(
            length: 6, // Number of digits
            showCursor: true, // Shows a cursor in the fields
            keyboardType: TextInputType.number, // Only numbers allowed
            onCompleted: (pin) {
              print('Entered OTP: $pin'); // Action when OTP is entered
            },
            onChanged: (value) {
              print('Current Input: $value'); // Logs each change
            },
            defaultPinTheme: PinTheme(
              width: 40,
              height: 40,
              textStyle: const TextStyle(
                fontSize: 20,
                color: Colors.black,
                fontWeight: FontWeight.bold,
              ),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
