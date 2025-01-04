import 'package:flutter/material.dart';

class Createparent extends StatefulWidget {
  const Createparent({super.key});

  @override
  State<Createparent> createState() => _CreateparentState();
}

class _CreateparentState extends State<Createparent> {
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
              const SizedBox(height: 60),
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
                    const Text(
                      'User Name',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(
                        height: 8), // Spacing between label and input
                    TextField(
                      decoration: InputDecoration(
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(15),
                        ), // Add a border around the input
                        hintText: 'Enter Your User Name', // Placeholder text
                      ),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 40),
              Container(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Child's Email Address",
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(
                        height: 8), // Spacing between label and input
                    TextField(
                      decoration: InputDecoration(
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(15),
                        ), // Add a border around the input
                        hintText:
                            "Enter Your Child's Email Address", // Placeholder text
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 60),
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
                  child: const Text('Create Account',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 17,
                          fontWeight: FontWeight.bold)),
                ),
              )
            ]),
      ),
    );
  }
}
