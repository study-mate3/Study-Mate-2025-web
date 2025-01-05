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
        body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 106),
        children: [
          Container(
            child: Image.asset(
              'assets/img/logo2.png',
              height: 42,
              width: 148,
            ),
          ),
          const SizedBox(height: 40),
          Container(
            child: const Text(
              'Create Your Account',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 20),
          Container(
            child: const Text(
              'Please enter the code sent to \n your phonr number to continue',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 18),
            ),
          ),
          const SizedBox(height: 40),
          Container(
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
          const SizedBox(height: 20),
          Container(
            child: Image.asset(
              'assets/img/otpsubmit.png',
              height: 250,
              width: 230,
            ),
          ),
          const SizedBox(height: 20),
          Container(
            child: ElevatedButton(
              onPressed: () {
                //login function
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0570B2),
                padding: const EdgeInsets.all(5),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(25),
                ),
              ),
              child: const Text('Continue',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 17,
                      fontWeight: FontWeight.bold)),
            ),
          )
        ],
      ),
    ));
  }
}
