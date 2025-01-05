import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'aboutsc1.dart';

class Home extends StatelessWidget {
  const Home({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 106),
          children: [
            Container(
              height: 450,
              width: 400,
              decoration: const BoxDecoration(
                image: DecorationImage(
                  image: AssetImage('assets/img/homebkground.png'),
                  fit: BoxFit.cover,
                ),
              ),
              child: Stack(
                alignment: Alignment.topCenter,
                children: [
                  Positioned(
                    top: 30,
                    child: Image.asset(
                      'assets/img/logo2.png',
                      height: 42,
                      width: 148,
                      color: Colors.black,
                    ),
                  ),
                  Positioned(
                      top: 50, child: Image.asset('assets/img/childplay.gif')),
                ],
              ),
            ),
            const SizedBox(height: 40),
            const Center(
              child: Column(children: [
                Text(
                  'Welcome to StudyMate',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF057082)),
                ),
                Text(
                  'Maseter your time, with out study smart app',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF057082)),
                ),
              ]),
            ),
            const SizedBox(height: 20),
            Container(
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => Aboutsc1()),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0570B2),
                  minimumSize: const Size(100, 50),
                  padding: const EdgeInsets.all(5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25),
                  ),
                ),
                child: const Text('Get Started',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.bold)),
              ),
            )
          ],
        ),
      ),
    );
  }
}
