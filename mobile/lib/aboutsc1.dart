import 'dart:ffi' as ffi;

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class Aboutsc1 extends StatelessWidget {
  const Aboutsc1({super.key});

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
              child: const Text('Boost focus with the Promodoro \n Technique!',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0745A3))),
            ),
            const SizedBox(height: 20),
            Container(
              child: Image.asset('assets/img/home_img3.png'),
            ),
            const SizedBox(height: 20),
            Container(
              child: const Text(
                'Work smarter with customizable timers \n and balanced breaks for productive study \n sessins',
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontSize: 18,
                    color: Color(0xFF0745A3),
                    fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 20),
            Center(
              child: SizedBox(
                width: 250,
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0570B2),
                    minimumSize: const Size(100, 50),
                    padding: const EdgeInsets.all(5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                  child: const Text('Skip and Login',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 17,
                          fontWeight: FontWeight.bold)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
