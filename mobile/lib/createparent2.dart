import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class Createparent2 extends StatefulWidget {
  const Createparent2({super.key});

  @override
  State<Createparent2> createState() => _Createparent2State();
}

class _Createparent2State extends State<Createparent2> {
  String? selectedOption;
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
              const SizedBox(height: 40),
              Container(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                        child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Select Your Gender',
                          style: TextStyle(
                              fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        RadioListTile<String>(
                          title: const Text('Male'),
                          value: 'Male',
                          groupValue: selectedOption,
                          onChanged: (value) {
                            setState(() {
                              selectedOption = value;
                            });
                          },
                        ),
                        RadioListTile<String>(
                          title: const Text('Female'),
                          value: 'Female',
                          groupValue: selectedOption,
                          onChanged: (value) {
                            setState(() {
                              selectedOption = value;
                            });
                          },
                        ),
                      ],
                    )),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              Center(
                  child: SizedBox(
                width: 250,
                child: ElevatedButton(
                  onPressed: () {
                    // function
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0570B2),
                    padding: const EdgeInsets.all(5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                  child: const Text('Create Account',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 17,
                          fontWeight: FontWeight.bold)),
                ),
              ))
            ]),
      ),
    );
  }
}
